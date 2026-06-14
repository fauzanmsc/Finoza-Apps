import os
import re

with open('apps-script/Code_backup.gs', 'r') as f:
    lines = f.readlines()

def get_function(func_name):
    # Extracts the whole function string
    start = -1
    for i, line in enumerate(lines):
        if line.startswith(f'function {func_name}('):
            start = i
            break
    if start == -1: return ""
    
    end = start
    brace_count = 0
    for i in range(start, len(lines)):
        brace_count += lines[i].count('{')
        brace_count -= lines[i].count('}')
        if brace_count == 0 and lines[i].strip() == '}':
            end = i
            break
    return "".join(lines[start:end+1]) + "\n\n"

# Helpers
helpers_funcs = [
    'getSheet', 'getRowsData', 'generateUUID', 'sanitizeInput', 
    'getUserIdFromToken', 'setupPermissions', 
    'createSuccessResponse', 'createErrorResponse'
]
helpers_code = ""
for f in helpers_funcs: helpers_code += get_function(f)

with open('apps-script/Helpers.gs', 'w') as f:
    f.write(helpers_code)

# GenericCrud
generic_funcs = ['handleGenericUpdate', 'handleGenericDelete']
generic_code = ""
for f in generic_funcs: generic_code += get_function(f)
with open('apps-script/GenericCrud.gs', 'w') as f:
    f.write(generic_code)

# Auth
auth_funcs = ['handleLogin', 'handleUpdateProfile']
auth_code = ""
for f in auth_funcs: auth_code += get_function(f)
with open('apps-script/Auth.gs', 'w') as f:
    f.write(auth_code)

# Dashboard
dash_funcs = ['handleGetDashboardData', 'handleGetReports']
dash_code = ""
for f in dash_funcs: dash_code += get_function(f)
with open('apps-script/Dashboard.gs', 'w') as f:
    f.write(dash_code)

# DummyData
dummy_funcs = ['handleGenerateDummyData']
dummy_code = ""
for f in dummy_funcs: dummy_code += get_function(f)
with open('apps-script/DummyData.gs', 'w') as f:
    f.write(dummy_code)

# DataEntities
entities_funcs = [
    'handleGetTransactions', 'handleCreateTransaction',
    'handleGetAccounts', 'handleCreateAccount',
    'handleGetBudgets', 'handleCreateBudget',
    'handleGetDebts', 'handleCreateDebt',
    'handleGetCategories', 'handleCreateCategory',
    'handleGetGoals', 'handleCreateGoal'
]
entities_code = ""
for f in entities_funcs: entities_code += get_function(f)
with open('apps-script/DataEntities.gs', 'w') as f:
    f.write(entities_code)

# Schedules
sched_funcs = [
    'handleGetSchedules', 'handleCreateSchedule', 
    'handleUpdateSchedule', 'handleDeleteSchedule', 'testCreateSchedule'
]
sched_code = ""
for f in sched_funcs: sched_code += get_function(f)
with open('apps-script/Schedules.gs', 'w') as f:
    f.write(sched_code)

# Now, we extract the core routing part from lines 1 to wherever doPost ends
# Let's just find the end of doPost
end_dopost = -1
brace_count = 0
for i, line in enumerate(lines):
    if line.startswith('function doPost(e)'):
        brace_count = 1
        continue
    if brace_count > 0:
        brace_count += line.count('{')
        brace_count -= line.count('}')
        if brace_count == 0 and line.strip() == '}':
            end_dopost = i
            break

# The header also has `const SPREADSHEET_ID` which might be used globally.
# Actually, let's keep the first line up to end_dopost
core_code = "".join(lines[0:end_dopost+1]) + "\n"
with open('apps-script/Code.gs', 'w') as f:
    f.write(core_code)

print("Split completed successfully.")
