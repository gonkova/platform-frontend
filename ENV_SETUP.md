# Environment Configuration

## Инструкции за настройка

Създайте файл `.env.local` в корена на проекта със следното съдържание:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### За Development:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### За Production:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

## Забележки:
- Променливите, които започват с `NEXT_PUBLIC_` са достъпни в browser-а
- Не commit-вайте `.env.local` файла в Git (той вече е в .gitignore)
- След промяна на environment променливи, рестартирайте dev server-а

