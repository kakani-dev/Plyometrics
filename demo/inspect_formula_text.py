import openpyxl

wb = openpyxl.load_workbook("NeuroPi_Grade8_12_Compact_Assessment_AI_Rules.xlsx", data_only=False)

def print_cell_info(sheet, coord):
    cell = sheet[coord]
    val = cell.value
    # If it's an ArrayFormula, it has a value attribute or can be converted to string
    val_str = str(val)
    if hasattr(val, 'ref') and hasattr(val, 'text'):
        val_str = f"ArrayFormula(ref={val.ref}, text={val.text})"
    print(f"{coord}: {val_str}")

print("--- Student_Response_Template Row 2 ---")
sheet = wb["Student_Response_Template"]
for col in ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R']:
    print_cell_info(sheet, f"{col}2")

print("\n--- Auto_Score_Summary Row 2 ---")
sheet = wb["Auto_Score_Summary"]
for col in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']:
    print_cell_info(sheet, f"{col}2")
    
# Let's inspect how the dashboard computes dominant factors
if "Dashboard" in wb.sheetnames:
    print("\n--- Dashboard Row 2 ---")
    sheet = wb["Dashboard"]
    for col in ['A', 'B', 'C', 'D']:
        print_cell_info(sheet, f"{col}2")
