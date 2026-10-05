موقع هاي روياليتي للاستثمار العقاري
=====================================
فتح الموقع:      افتح index.html بالمتصفح (يعمل بدون إنترنت أيضًا)
الكتالوج أونلاين: catalog/index.html
الكتالوج PDF:     catalog/High-Royalty-Catalog-2026.pdf

الرفع على الإنترنت: ارفع محتويات مجلد site كما هي على أي استضافة
(Netlify / Vercel / GitHub Pages / cPanel) — لا يحتاج سيرفر أو قاعدة بيانات.

إعادة بناء الكتالوج بعد تعديل الصور: python _catalog_build/build.py
ثم اطبعه بكروم:
"C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --no-pdf-header-footer --allow-file-access-from-files --virtual-time-budget=15000 --print-to-pdf="_catalog_build\out.pdf" "_catalog_build\catalog.html"
وانسخ out.pdf إلى site/catalog/High-Royalty-Catalog-2026.pdf
