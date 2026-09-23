# Discord Bot Panel

Статический адаптивный фронтенд панели Discord-бота.

## Запуск

Файлы можно открыть напрямую через `index.html` или запустить локально:

```powershell
py -m http.server 8000 --directory docs
```

После этого откройте `http://localhost:8000`.

## GitHub Pages

1. Загрузите содержимое проекта в репозиторий GitHub.
2. Откройте **Settings → Pages**.
3. В разделе **Build and deployment** выберите **Deploy from a branch**.
4. Выберите основную ветку и каталог `/docs`.
5. Сохраните — сайт опубликуется по адресу `https://<user>.github.io/<repository>/`.

Панель работает без сборщика, библиотек и настоящего Discord API. Токены в статический фронтенд не добавляются.
