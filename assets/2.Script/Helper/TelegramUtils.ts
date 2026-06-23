

export function disableVerticalSwipe() {
   try {
      //@ts-ignore
      window.Telegram.WebApp.disableVerticalSwipes()

      const overflow = 5
      document.body.style.overflowY = 'hidden'
      document.body.style.marginTop = `${overflow}px`
      document.body.style.height = window.innerHeight + overflow + "px"
      document.body.style.paddingBottom = `${overflow}px`
      window.scrollTo(0, overflow)

      window.parent.postMessage(JSON.stringify({ eventType: 'web_app_setup_closing_behavior', eventData: { need_confirmation: false } }), '*');
   } catch (error) { console.log(error); }
}