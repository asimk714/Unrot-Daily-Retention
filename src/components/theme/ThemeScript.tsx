export function ThemeScript() {
  const scriptContent = `(function() {
  try {
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = saved === 'dark' || (!saved && prefersDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {}
})();`;

  return (
    <script
      id="theme-script"
      dangerouslySetInnerHTML={{ __html: scriptContent }}
    />
  );
}
