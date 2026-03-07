#!/usr/bin/env python
"""
Analyze CSV headers and first few rows
"""
import csv
import json

csv_file = 'Equipment_List_-_31-01-2026_167596.csv'

# Try different encodings
encodings = ['cp1255', 'windows-1255', 'utf-8-sig', 'iso-8859-8', 'latin1']

for encoding in encodings:
    try:
        with open(csv_file, 'r', encoding=encoding, errors='replace') as f:
            content = f.read(5000)

        # Parse CSV from string
        import io
        csvfile = io.StringIO(content)

        delimiter = ';' if ';' in content[:500] else ','
        reader = csv.DictReader(csvfile, delimiter=delimiter)

        result = {
            'encoding': encoding,
            'delimiter': delimiter,
            'headers': list(reader.fieldnames),
            'sample_rows': []
        }

        for i, row in enumerate(reader, 1):
            if i > 3:
                break
            result['sample_rows'].append(dict(row))

        # Save to JSON file
        with open('csv_analysis.json', 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"✓ Analysis saved to csv_analysis.json")
        print(f"✓ Encoding: {encoding}")
        print(f"✓ Headers count: {len(result['headers'])}")
        print(f"✓ Sample rows: {len(result['sample_rows'])}")

        # Print headers
        print("\nHeaders (numbered):")
        for i, header in enumerate(result['headers'], 1):
            print(f"  {i}. {header}")

        break

    except Exception as e:
        print(f"✗ {encoding} failed: {e}")
        continue
