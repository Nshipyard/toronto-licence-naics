#!/usr/bin/env python3
"""Build derived data for toronto-licence-naics from the raw City of Toronto
Business Licences CSV.

Inputs:  data/raw/business-licences.csv (NOT committed)
Outputs: data/licence_to_naics.csv, data/summary.json, data/licences_index.json
         public/data/licence_to_naics.csv (downloadable copy)

Mapping: Toronto licence categories -> NAICS 2022 (Statistics Canada structure).
Confidence: exact | close | broad | none.
"""

import csv
import json
import os
import shutil
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW = os.path.join(HERE, "data", "raw", "business-licences.csv")
WARD_SRC = os.path.expanduser(
    "~/workspace/toronto-geo-concordances/data/ward25_to_hood158.csv")

SECTORS = {
    "11": "Agriculture, forestry, fishing and hunting",
    "21": "Mining, quarrying, and oil and gas extraction",
    "22": "Utilities",
    "23": "Construction",
    "31": "Manufacturing",
    "41": "Wholesale trade",
    "44": "Retail trade",
    "48": "Transportation and warehousing",
    "51": "Information and cultural industries",
    "52": "Finance and insurance",
    "53": "Real estate and rental and leasing",
    "54": "Professional, scientific and technical services",
    "55": "Management of companies and enterprises",
    "56": "Administrative and support, waste management and remediation services",
    "61": "Educational services",
    "62": "Health care and social assistance",
    "71": "Arts, entertainment and recreation",
    "72": "Accommodation and food services",
    "81": "Other services (except public administration)",
    "91": "Public administration",
}

# category -> (naics_code, naics_title, confidence, rule)
# confidence: exact | close | broad | none (none = permit/artifact, not a business)
MAPPING = {
 "** Class record not on file. (138)": ("", "", "none",
    "Data artifact: placeholder category from the source system; no business activity described."),
 "ADULT ENTERTAINMENT CLUB": ("722410", "Drinking places (alcoholic beverages)", "close",
    "NAICS has no adult-entertainment class; mapped by the primary licensed activity (alcohol service)."),
 "ADVERTISING": ("541810", "Advertising agencies", "close",
    "Legacy category; mapped to the advertising services industry."),
 "AMUSEMENT ESTABLISHMENT": ("713120", "Amusement arcades", "close",
    "Arcades and amusement venues; closest NAICS class is amusement arcades."),
 "AUCTIONEER": ("44", "Retail trade", "broad",
    "NAICS 2022 has no dedicated auction class; mapped at sector level."),
 "AUTO SERVICE STATION": ("811111", "General automotive repair", "close",
    "Legacy category; repair is the licensed activity, fuel retail secondary."),
 "BATH HOUSE": ("812190", "Other personal care services", "close",
    "NAICS has no bath-house class; mapped to personal care services."),
 "BILL DISTRIBUTOR": ("541870", "Advertising material distribution services", "close",
    "Flyer and bill distribution is advertising material distribution."),
 "BILLIARD HALL": ("713990", "All other amusement and recreation industries", "close",
    "Billiard halls fall in the amusement catch-all."),
 "BOATS FOR HIRE": ("487210", "Scenic and sightseeing transportation, water", "close",
    "Charter boats map to water-based scenic transportation."),
 "BODY RUB PARLOUR": ("812190", "Other personal care services", "close",
    "NAICS has no adult-services class; mapped to personal care."),
 "BOWLING HOUSE": ("713950", "Bowling centres", "exact", "Direct match."),
 "BUILDING CLEANER": ("561720", "Janitorial services", "exact", "Direct match."),
 "BUILDING RENOVATOR": ("236118", "Residential remodelers", "exact", "Direct match."),
 "CARNIVAL": ("713990", "All other amusement and recreation industries", "close",
    "Travelling carnivals fall in the amusement catch-all."),
 "CHIMNEY REPAIRMAN": ("238990", "All other specialty trade contractors", "close",
    "Specialty trade with no dedicated class."),
 "CIRCUS": ("713990", "All other amusement and recreation industries", "close",
    "Circuses fall in the amusement catch-all."),
 "CLOTHING DROP BOX LOCATION PERMIT": ("459510", "Used merchandise retailers", "close",
    "Site permit for used-clothing collection; the operator retails used goods."),
 "CLOTHING DROP BOX OPERATOR": ("459510", "Used merchandise retailers", "close",
    "Operators sell donated used clothing."),
 "COLLECTOR OF SECOND HAND GOODS": ("459510", "Used merchandise retailers", "close",
    "Used-goods trade."),
 "COMMERCIAL PARKING LOT": ("812930", "Parking lots and garages", "exact", "Direct match."),
 "CURB LANE CAFE": ("722511", "Full-service restaurants", "close",
    "Cafe patios licensed separately; same industry as restaurants."),
 "CURBLANE VENDING": ("44", "Retail trade", "broad",
    "Curbside vending; no dedicated NAICS class."),
 "DRAIN CONTRACTOR": ("238220", "Plumbing, heating and air-conditioning contractors", "close",
    "Drain work is licensed under the plumbing trade."),
 "DRAIN LAYER": ("238220", "Plumbing, heating and air-conditioning contractors", "close",
    "Drain laying is licensed under the plumbing trade."),
 "DRIVE-SELF RENTAL OWNER": ("532111", "Passenger car rental", "exact",
    "Car rental agencies."),
 "DRIVEWAY PAVING CONTRACTOR": ("238990", "All other specialty trade contractors", "close",
    "Asphalt and paving specialty trade."),
 "DRIVING INSTRUCTOR (V)": ("611692", "Automobile driving schools", "exact", "Direct match."),
 "DRIVING SCHOOL OPERATOR (B)": ("611692", "Automobile driving schools", "exact", "Direct match."),
 "DRIVING SCHOOL OPERATOR (V)": ("611692", "Automobile driving schools", "exact", "Direct match."),
 "EATING OR DRINKING ESTABLISHMENT": ("722511", "Full-service restaurants", "exact",
    "Sit-down restaurants and bars serving food."),
 "ENTERTAINMENT ESTABLISHMENT/NIGHTCLUB": ("722410", "Drinking places (alcoholic beverages)", "close",
    "Nightclubs' primary licensed activity is alcohol service."),
 "ENTERTAINMENT PLACE OF ASSEMBLY": ("713990", "All other amusement and recreation industries", "close",
    "Assembly and event halls fall in the amusement catch-all."),
 "EXPANDED EATING/DRINKING ESTABLISHMENT": ("722511", "Full-service restaurants", "close",
    "Patio expansions of restaurants."),
 "EXPANDED ENTERTAINMENT PLACE OF ASSEMBLY": ("713990", "All other amusement and recreation industries", "close",
    "Expanded assembly halls; same catch-all as the base category."),
 "HAWKER/PEDLAR ON FOOT": ("44", "Retail trade", "broad",
    "Street vending; no dedicated NAICS class."),
 "HAWKER/PEDLAR WITH MOTOR VEHICLE": ("44", "Retail trade", "broad",
    "Street vending; no dedicated NAICS class."),
 "HAWKER/PEDLAR WITH PUSH CART": ("44", "Retail trade", "broad",
    "Street vending; no dedicated NAICS class."),
 "HEATING CONTRACTOR": ("238220", "Plumbing, heating and air-conditioning contractors", "exact",
    "Heating is within NAICS 238220."),
 "HOLISTIC CENTRE": ("812190", "Other personal care services", "close",
    "Wellness and massage services; closest personal-care class."),
 "INSULATION INSTALLER": ("238310", "Drywall and insulation contractors", "exact", "Direct match."),
 "LAUNDRY PREMISES": ("812320", "Dry-cleaning and laundry services (except coin-operated)", "close",
    "Laundry premises; the coin-operated subset would be 812310."),
 "LIMOUSINE OWNER": ("485320", "Limousine service", "exact", "Direct match."),
 "LIMOUSINE SERVICE COMPANY": ("485320", "Limousine service", "exact", "Direct match."),
 "MARKETING DISPLAY": ("541850", "Outdoor advertising", "close",
    "Display advertising structures."),
 "MASTER HEATING INSTALLER": ("238220", "Plumbing, heating and air-conditioning contractors", "exact",
    "Heating is within NAICS 238220."),
 "MASTER PLUMBER": ("238220", "Plumbing, heating and air-conditioning contractors", "exact",
    "Direct match."),
 "MOBILE VENDING (FOOD TRUCK)": ("722330", "Mobile food services", "exact", "Direct match."),
 "MOBILE VENDING (ICE CREAM TRUCK)": ("722330", "Mobile food services", "exact", "Direct match."),
 "MOTOR VEHICLE RACING": ("713990", "All other amusement and recreation industries", "close",
    "Race tracks fall in the amusement catch-all."),
 "MOTORIZED REFRESHMENT VEHICLE OWNER": ("722330", "Mobile food services", "exact", "Direct match."),
 "NOISE EXEMPTION": ("", "", "none",
    "Event and construction permit, not a business activity; excluded from sector totals."),
 "NON-MOTORIZED REFRESHMENT VEHICLE OWNER": ("722330", "Mobile food services", "exact", "Direct match."),
 "PAWN SHOP": ("522298", "All other non-depository credit intermediation", "close",
    "NAICS classifies pawnshops as credit intermediation, not retail."),
 "PAYDAY LOAN": ("522390", "Other activities related to credit intermediation", "close",
    "Payday lenders are credit intermediation."),
 "PEDICAB OWNER": ("485990", "Other transit and ground passenger transportation", "close",
    "No pedicab class; ground-passenger catch-all."),
 "PERMANENT FIREWORKS VENDOR": ("459999", "All other miscellaneous retailers", "close",
    "Specialty retail with no dedicated class."),
 "PERSONAL SERVICES SETTINGS": ("812190", "Other personal care services", "close",
    "Licensed premises spanning barber, beauty, tattoo and aesthetics; 812190 is the umbrella personal-care class."),
 "PET SHOP": ("459910", "Pet and pet supplies retailers", "exact", "Direct match."),
 "PLUMBING & HEATING CONTRACTOR": ("238220", "Plumbing, heating and air-conditioning contractors", "exact",
    "Direct match."),
 "PLUMBING CONTRACTOR": ("238220", "Plumbing, heating and air-conditioning contractors", "exact",
    "Direct match."),
 "PRECIOUS METAL SHOP": ("458310", "Jewellery, luggage and leather goods retailers", "close",
    "Gold buyers; closest retail class is jewellery."),
 "PRIVATE PARKING ENFORCEMENT AGENCY": ("561612", "Security guards and patrol services", "close",
    "Enforcement patrol maps to security services."),
 "PRIVATE TRANSPORTATION COMPANY": ("485990", "Other transit and ground passenger transportation", "close",
    "Ride-hail companies; no dedicated NAICS class."),
 "PUBLIC GARAGE": ("811111", "General automotive repair", "close",
    "Toronto 'public garage' licences are motor-vehicle repair shops."),
 "SECOND HAND SALVAGE SHOP": ("459510", "Used merchandise retailers", "close",
    "Used-goods trade."),
 "SECOND HAND SALVAGE YARD": ("415310", "Used motor vehicle parts and accessories merchant wholesalers", "close",
    "Auto salvage yards dismantle vehicles for used parts; StatCan NAICS 2022 code."),
 "SECOND HAND SHOP": ("459510", "Used merchandise retailers", "exact", "Direct match."),
 "SHORT TERM RENTAL COMPANY": ("531390", "Other activities related to real estate", "close",
    "Licensed intermediaries (platforms), not lodging operators."),
 "SIDEWALK CAFE": ("722511", "Full-service restaurants", "close",
    "Sidewalk patios of restaurants."),
 "SIDEWALK VENDING": ("44", "Retail trade", "broad",
    "Sidewalk vending; no dedicated NAICS class."),
 "SMOKE SHOP": ("459991", "Tobacco, electronic cigarette and other smoking supplies retailers", "exact",
    "NAICS 2022 added this class."),
 "SWIMMING POOL": ("713990", "All other amusement and recreation industries", "close",
    "Commercial pools fall in the amusement catch-all."),
 "TAKE-OUT OR RETAIL FOOD ESTABLISHMENT": ("722512", "Limited-service eating places", "close",
    "Category spans take-out counters and small food retail; limited-service is the primary match."),
 "TAXICAB BROKER": ("485310", "Taxi service", "close",
    "Dispatch brokerages; closest taxi class."),
 "TAXICAB OPERATOR": ("485310", "Taxi service", "exact", "Direct match."),
 "TAXICAB OWNER": ("485310", "Taxi service", "exact", "Direct match."),
 "TEMPORARY FIREWORKS VENDOR (OVER 25 KG)": ("44", "Retail trade", "broad",
    "Temporary seasonal retail; no dedicated class."),
 "TEMPORARY FIREWORKS VENDOR (UNDER 25 KG)": ("44", "Retail trade", "broad",
    "Temporary seasonal retail; no dedicated class."),
 "TEMPORARY LEASE FIREWORKS VENDOR": ("44", "Retail trade", "broad",
    "Temporary seasonal retail; no dedicated class."),
 "TEMPORARY MOBILE FIREWORKS VENDOR": ("44", "Retail trade", "broad",
    "Temporary seasonal retail; no dedicated class."),
 "TEMPORARY SIGN - A-FRAME": ("541850", "Outdoor advertising", "close",
    "Sign companies; outdoor advertising."),
 "TEMPORARY SIGN - GROUND-MOUNTED": ("541850", "Outdoor advertising", "close",
    "Sign companies; outdoor advertising."),
 "TEMPORARY SIGN - MOBILE": ("541850", "Outdoor advertising", "close",
    "Sign companies; outdoor advertising."),
 "TEMPORARY SIGN - NEW DEVELOPMENT A-FRAME": ("541850", "Outdoor advertising", "close",
    "Sign companies; outdoor advertising."),
 "TEMPORARY SIGN - PORTABLE": ("541850", "Outdoor advertising", "close",
    "Sign companies; outdoor advertising."),
 "TEMPORARY SIGN PROVIDER": ("541850", "Outdoor advertising", "close",
    "Sign companies; outdoor advertising."),
 "THEATRE": ("512131", "Motion picture theatres", "close",
    "Legacy category; presumed cinema use."),
 "TORONTO TAXICAB OWNER": ("485310", "Taxi service", "exact", "Direct match."),
 "TOW TRUCK OWNER": ("488410", "Motor vehicle towing", "exact",
    "All 4,848 records are cancelled: Ontario moved tow licensing to the province in 2024."),
 "TRANSIENT TRADER": ("44", "Retail trade", "broad",
    "Itinerant retail; no dedicated class."),
 "VAPOUR PRODUCT RETAILER": ("459991", "Tobacco, electronic cigarette and other smoking supplies retailers", "exact",
    "NAICS 2022 added this class."),
}


def sector_of(code):
    if not code:
        return ""
    s = code[:2]
    # NAICS 2022 spans: 31-33 manufacturing, 44-45 retail, 48-49 transportation
    if s in ("32", "33"):
        return "31"
    if s == "45":
        return "44"
    if s == "49":
        return "48"
    return s


def main():
    active_by_cat = Counter()
    total_by_cat = Counter()
    ward_active = Counter()
    ward_sector_active = Counter()
    issued_by_cat_year = defaultdict(Counter)
    index_rows = []

    with open(RAW, newline="", encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            cat = row["Category"].strip()
            total_by_cat[cat] += 1
            if cat not in MAPPING:
                raise SystemExit(f"Unmapped category in source: {cat!r}")
            cancelled = bool(row["Cancel Date"].strip())
            if not cancelled:
                active_by_cat[cat] += 1
                ward = row["Ward"].strip()
                ward_active[ward] += 1
                code = MAPPING[cat][0]
                ward_sector_active[(ward, sector_of(code))] += 1
                yr = row["Issued"].strip()[:4]
                if yr.isdigit():
                    issued_by_cat_year[cat][yr] += 1
                index_rows.append({
                    "n": row["Operating Name"].strip(),
                    "c": cat,
                    "w": ward,
                    "i": yr if yr.isdigit() else "",
                    "l": row["Licence No."].strip(),
                })

    n_active = sum(active_by_cat.values())
    n_total = sum(total_by_cat.values())
    mapped_cats = [c for c in MAPPING if MAPPING[c][2] != "none"]
    unmapped = [c for c in MAPPING if MAPPING[c][2] == "none"]
    active_mapped = sum(active_by_cat[c] for c in mapped_cats)
    coverage = active_mapped / n_active if n_active else 0

    # --- licence_to_naics.csv ---
    map_path = os.path.join(HERE, "data", "licence_to_naics.csv")
    with open(map_path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["licence_category", "active_licences", "total_licences",
                    "naics_code", "naics_title", "sector_code", "sector_title",
                    "confidence", "mapping_rule"])
        for cat in sorted(MAPPING):
            code, title, conf, rule = MAPPING[cat]
            sec = sector_of(code)
            w.writerow([cat, active_by_cat.get(cat, 0), total_by_cat.get(cat, 0),
                        code, title, sec, SECTORS.get(sec, ""), conf, rule])

    # --- licences_index.json (active licences, trimmed) ---
    with open(os.path.join(HERE, "data", "licences_index.json"), "w", encoding="utf-8") as f:
        json.dump(index_rows, f, ensure_ascii=False, separators=(",", ":"))

    # --- ward names from project 1 ---
    ward_names = {}
    try:
        with open(WARD_SRC, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                code = row["ward_25"].lstrip("0") or "0"
                ward_names.setdefault(code, row["ward_name"])
    except FileNotFoundError:
        pass

    # --- sector aggregates ---
    sector_active = Counter()
    for cat in mapped_cats:
        sector_active[sector_of(MAPPING[cat][0])] += active_by_cat.get(cat, 0)
    sectors = [{"code": s, "title": SECTORS[s], "active": sector_active[s]}
               for s in sorted(sector_active, key=lambda s: -sector_active[s])]

    # --- ward x sector ---
    wards = []
    for ward in sorted(ward_active, key=lambda x: (x == "", x)):
        if ward == "":
            continue
        sec_counts = {s: ward_sector_active[(ward, s)] for s in SECTORS if ward_sector_active[(ward, s)]}
        top = sorted(sec_counts.items(), key=lambda kv: -kv[1])[:3]
        wards.append({
            "ward": ward,
            "name": ward_names.get(ward, f"Ward {ward}"),
            "active": ward_active[ward],
            "top_sectors": [{"code": s, "title": SECTORS[s], "active": n} for s, n in top],
        })

    # --- growth: issued per category per year, 2019-2026 ---
    growth = []
    for cat, years in issued_by_cat_year.items():
        early = sum(years[y] for y in ("2019", "2020", "2021"))
        late = sum(years[y] for y in ("2024", "2025", "2026"))
        if early + late >= 60:
            growth.append({"category": cat, "early": early, "late": late,
                           "change": late - early,
                           "naics": MAPPING[cat][0], "active": active_by_cat[cat]})
    growth.sort(key=lambda g: -g["change"])

    top_categories = [
        {"category": c, "active": active_by_cat[c], "naics": MAPPING[c][0],
         "naics_title": MAPPING[c][1], "confidence": MAPPING[c][2]}
        for c, _ in active_by_cat.most_common(15)
    ]

    summary = {
        "meta": {
            "source": "City of Toronto Open Data: Municipal Licensing and Standards - Business Licences and Permits",
            "source_url": "https://open.toronto.ca/dataset/municipal-licensing-and-standards-business-licences-and-permits/",
            "retrieved": "2026-10-08",
            "total_records": n_total,
            "active_licences": n_active,
            "cancelled_records": n_total - n_active,
            "categories_total": len(MAPPING),
            "categories_mapped": len(mapped_cats),
            "categories_unmapped": unmapped,
            "coverage_active_pct": round(coverage * 100, 2),
            "note": "Active = no Cancel Date on the record. NAICS 2022 structure (Statistics Canada).",
        },
        "sectors": sectors,
        "top_categories": top_categories,
        "wards": wards,
        "growth": growth[:10],
        "limitations": [
            "Active means the record has no Cancel Date; a licence can be inactive in practice while its record lacks a cancel date.",
            "5,424 active records (14.5%) have no ward; ward analysis covers the remaining 85.5%.",
            "NAICS mapping is interpretive: Toronto licence categories do not correspond 1:1 with NAICS classes. Confidence is exact for 24 categories, close for 51, broad (sector level) for 15, and none for 2.",
            "Tow-truck licensing moved to the Province of Ontario in 2024, so all 4,848 tow records are cancelled and the category shows zero active licences.",
            "The dataset is a point-in-time snapshot; issue dates before 2000 are sparse and may reflect data entry rather than business age.",
        ],
    }
    with open(os.path.join(HERE, "data", "summary.json"), "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    # public copy for download
    os.makedirs(os.path.join(HERE, "public", "data"), exist_ok=True)
    shutil.copy(map_path, os.path.join(HERE, "public", "data", "licence_to_naics.csv"))

    print(f"active={n_active} total={n_total} coverage={coverage:.2%}")
    print(f"sectors={len(sectors)} wards={len(wards)} index_rows={len(index_rows)}")
    print("unmapped:", unmapped)


if __name__ == "__main__":
    main()
