import AssetContainer from "../Main/AssetContainer";

const { ccclass, property } = cc._decorator;

export const TextNotificationBGColor = {
   RED: new cc.Color().fromHEX("#FF4848E3"),
   GREEN: new cc.Color().fromHEX("#64FF45"),
}

@ccclass
export default class TextNotification extends cc.Component {
   @property moveOffset = 130;
   @property(cc.Node) content: cc.Node = null;
   @property(cc.Label) descriptionLb: cc.Label = null;
   @property([cc.Node]) statusIndicators: cc.Node[] = [];

   originY = 0;

   protected onLoad(): void {
      this.scheduleOnce(() => {
         this.originY = this.node.y;
         cc.tween(this.node).to(0.33, { y: this.originY - this.moveOffset }, { easing: "sineIn" }).start()
      })
   }
}

export function callTextNotification(expireTime, description, bgColor) {
   const asset = AssetContainer.ins;
   const pref = asset.textNotificationPref;

   let dialog = cc.instantiate(pref);
   dialog.setParent(cc.director.getScene().getChildByName('Canvas'));
   dialog.setPosition(cc.v2(0, 0));

   let script = dialog.getComponent(TextNotification);

   script.descriptionLb.node.color = bgColor;
   script.descriptionLb.string = description;
   script.statusIndicators.forEach(node => { node.active = false; });

   switch (bgColor) {
      case TextNotificationBGColor.GREEN: {
         script.statusIndicators[0].active = true;
         break;
      } case TextNotificationBGColor.RED: {
         script.statusIndicators[1].active = true;
         break;
      }
   }

   script.scheduleOnce(() => {
      cc.tween(script.node).to(0.33, { y: script.originY }, { easing: "sineOut" }).call(() => {
         script.node.destroy()
      }).start()
   }, expireTime)

   return script
}