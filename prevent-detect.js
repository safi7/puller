Object.defineProperty(navigator, 'languages', {
  get: function() {
    return ['en-US', 'en'];
  }
});

// Object.defineProperty(navigator, 'plugins', {
//   get: function() {
//     return [1, 2, 3, 4, 5];
//   }
// });

(function generatePluginArray() {
  const pluginData = [
    { name: 'Chrome PDF Plugin', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
    { name: 'Chrome PDF Viewer', filename: 'mhjfbmdgcfjbbpaeojofohoefgiehjai', description: '' },
    { name: 'Native Client', filename: 'internal-nacl-plugin', description: '' }
  ];
  const pluginArray = [];
  pluginData.forEach(p => {
    function FakePlugin() {
      return p;
    }
    const plugin = new FakePlugin();
    Object.setPrototypeOf(plugin, Plugin.prototype);
    pluginArray.push(plugin);
  });
  Object.setPrototypeOf(pluginArray, PluginArray.prototype);
  return pluginArray;
})();

Object.defineProperty(navigator, 'doNotTrack', {
  get: function() {
    // this just needs to have `length > 0`, but we could mock the plugins too
    return '1';
  }
});

Object.defineProperty(navigator, 'webdriver', {
  get: function() {
    // this just needs to have `length > 0`, but we could mock the plugins too
    return undefined;
  }
});
