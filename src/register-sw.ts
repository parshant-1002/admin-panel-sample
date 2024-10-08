const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        return registration.scope;
      })
      .catch((err) => {
        return err;
      });
  }
};

export default registerServiceWorker;
