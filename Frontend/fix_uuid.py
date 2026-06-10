import os
files = [
    'C:/Users/carecircle/Frontend/app/dashboard/admin/page.tsx',
    'C:/Users/carecircle/Frontend/app/dashboard/patient/page.tsx',
    'C:/Users/carecircle/Frontend/app/dashboard/doctor/page.tsx',
    'C:/Users/carecircle/Frontend/app/dashboard/staff/page.tsx',
    'C:/Users/carecircle/Frontend/app/dashboard/patient/queue/RealtimePatientQueueWidget.tsx'
]

fake_uuid = '00000000-0000-0000-0000-000000000000'

for path in files:
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        content = content.replace('"Q-HSP-101"', f'"{fake_uuid}"')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
print('Done replacing Q-HSP-101')
