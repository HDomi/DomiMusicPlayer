const MakeToast = (vueInstance, text, toastType, time) => {
  const toastInfo = {
    position: "top-center",
    timeout: time,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: false,
    showCloseButtonOnHover: false,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
  }
  switch (toastType) {
    case 'success':
      vueInstance.$toast.success(text, toastInfo);
      break;
    case 'warning':
      vueInstance.$toast.warning(text, toastInfo);
      break;
    case 'error':
      vueInstance.$toast.error(text, toastInfo);
      break;
  }
};
export default MakeToast;


