const { ccclass, property } = cc._decorator;

@ccclass
export default class CanvasController extends cc.Component {
   protected onLoad(): void {
      let canvas = this.getComponent(cc.Canvas)

      let screenRat = cc.view.getVisibleSize().width / cc.view.getVisibleSize().height

      if (screenRat <= 1080 / 1920) {
         canvas.fitHeight = false
         canvas.fitWidth = true
      } else {
         canvas.fitHeight = true
         canvas.fitWidth = false
      }
   }
}
