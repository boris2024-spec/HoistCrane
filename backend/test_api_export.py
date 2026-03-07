"""
Тест API endpoints для экспорта Excel
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

# Тестовые учетные данные (используйте реальные, если есть)
USERNAME = "admin"
PASSWORD = "admin123"


def get_token():
    """Получить JWT токен"""
    response = requests.post(f"{BASE_URL}/token/", json={
        "username": USERNAME,
        "password": PASSWORD
    })
    if response.status_code == 200:
        return response.json()['access']
    else:
        print(f"Ошибка авторизации: {response.status_code}")
        print(f"Ответ: {response.text}")
        return None


def test_equipment_export_excel(token):
    """Тест экспорта оборудования в Excel"""
    headers = {
        'Authorization': f'Bearer {token}'
    }

    print("\n📊 Тестируем экспорт оборудования в Excel...")
    response = requests.get(
        f"{BASE_URL}/equipment/export_excel/", headers=headers)

    if response.status_code == 200:
        filename = f"equipment_test_export.xlsx"
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"✓ Успешно! Файл сохранен: {filename}")
        print(f"✓ Размер файла: {len(response.content)} байт")
        print(f"✓ Content-Type: {response.headers.get('Content-Type')}")
        return True
    else:
        print(f"✗ Ошибка: {response.status_code}")
        print(f"Ответ: {response.text}")
        return False


def test_documents_export_excel(token):
    """Тест экспорта документов в Excel"""
    headers = {
        'Authorization': f'Bearer {token}'
    }

    print("\n📄 Тестируем экспорт документов в Excel...")
    response = requests.get(
        f"{BASE_URL}/documents/export_excel/", headers=headers)

    if response.status_code == 200:
        filename = f"documents_test_export.xlsx"
        with open(filename, 'wb') as f:
            f.write(response.content)
        print(f"✓ Успешно! Файл сохранен: {filename}")
        print(f"✓ Размер файла: {len(response.content)} байт")
        print(f"✓ Content-Type: {response.headers.get('Content-Type')}")
        return True
    else:
        print(f"✗ Ошибка: {response.status_code}")
        print(f"Ответ: {response.text}")
        return False


if __name__ == "__main__":
    print("🔐 Получаем токен авторизации...")
    token = get_token()

    if token:
        print("✓ Токен получен успешно")

        # Тесты экспорта
        equipment_ok = test_equipment_export_excel(token)
        documents_ok = test_documents_export_excel(token)

        print("\n" + "="*50)
        print("📋 Результаты тестов:")
        print(f"  Equipment Export: {'✓ PASS' if equipment_ok else '✗ FAIL'}")
        print(f"  Documents Export: {'✓ PASS' if documents_ok else '✗ FAIL'}")
        print("="*50)

        if equipment_ok and documents_ok:
            print("\n🎉 Все тесты пройдены успешно!")
            print("📝 Откройте созданные файлы в Excel для проверки отображения иврита")
        else:
            print("\n⚠️ Некоторые тесты не прошли")
    else:
        print("✗ Не удалось получить токен авторизации")
        print("Убедитесь, что:")
        print("  1. Django сервер запущен (python manage.py runserver)")
        print("  2. Учетные данные верны (USERNAME и PASSWORD)")
