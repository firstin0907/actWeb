import os

# 변환할 폴더 경로 지정
folder_path = r"C:\\Users\\Gisub\\Desktop\\actWeb\\data"  # 여기에 실제 폴더 경로를 넣으세요

# 추가할 헤더
header = "term,E,P,A,E2,P2,A2,instcodes\n"

cultures = set()

# 폴더 내의 모든 파일 탐색
for filename in os.listdir(folder_path):
    if filename.endswith(".csv"):

        dat_path = os.path.join(folder_path, filename)
        with open(dat_path, "r", encoding="utf-8") as f:
            content = f.read()

        content = content.replace('_', ' ')
        new_content = ''

        prev = ' '
        for curr in content:
            if prev.islower() and curr.isupper():
                new_content += ' ' + curr.lower()
            else:
                new_content += curr

            prev = curr

        with open(dat_path, "w", encoding="utf-8") as f:
            f.write(new_content)


        continue
        dat_path = os.path.join(folder_path, filename)
        csv_path = os.path.join(folder_path, os.path.splitext(filename)[0] + ".csv")

        # dat 파일 읽기
        with open(dat_path, "r", encoding="utf-8") as f:
            content = f.read()

        # 헤더 추가 후 csv 파일로 저장
        with open(csv_path, "w", encoding="utf-8", newline="") as f:
            f.write(header + content)

        print(f"변환 완료: {filename} → {os.path.basename(csv_path)}")


print(cultures)
for i in cultures:
    backup = i
    i = i.capitalize().replace('19', ' 19').replace('20', ' 20')
    print(f"<option value=\"{backup}\">{i}</option>")