csvfix read_dsv -s '\t' all_mappings.csv | csvfix order -f 2,8 -ifn | sort | uniq > all_institutions.csv 
csvfix order -f 2 all_institutions.csv | sort | uniq -c | sed 's|\([0-9]\) |\1,|' > country_counts.csv
csvfix join -f 1:2 country_code_map.csv counts_by_country.csv > counts_by_country_final.csv
