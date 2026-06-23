import Utils from "../../Helper/Utils";
import AssetContainer from "../../Main/AssetContainer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LevelUpPopup extends cc.Component {
   public static currentPopup: LevelUpPopup = null;
   @property(cc.Node) content: cc.Node = null;
   @property(cc.Label) descriptionLb: cc.Label = null;
   @property(cc.Label) confirmBtnTextLb: cc.Label = null;

   blockAllAction = false;
   onConfirm = null;
   onConfirm2 = null;
   onClose = null;

   originY = 0

   protected onLoad(): void {
      LevelUpPopup.currentPopup = this;
      // this.blockAllAction = true;
      // this.scheduleOnce(() => {
      //    this.originY = this.node.y;

      //    cc.tween(this.node).to(0.33, { y: this.originY + this.content.height }, { easing: "sineIn" }).call(() => {
      //       this.blockAllAction = false;
      //    }).start()
      // })
   }

   onClickConfirm() {
      if (this.blockAllAction) return
      this.blockAllAction = true

      Utils.fadeOutNode(this.node, 0.25, () => {
         if (this.onConfirm) this.onConfirm?.();
      }, true);
   }

   onClick2Confirm() {
      if (this.blockAllAction) return
      this.blockAllAction = true

      Utils.fadeOutNode(this.node, 0.25, () => {
         if (this.onConfirm) this.onConfirm2?.();
      }, true);
   }

   onClickClose() {
      if (this.blockAllAction) return
      this.blockAllAction = true

      Utils.fadeOutNode(this.node, 0.25, () => {
         if (this.onConfirm) this.onClose?.();
      }, true);
   }

   protected onDestroy(): void {
      if (LevelUpPopup.currentPopup == this) LevelUpPopup.currentPopup = null;
   }
}

export function callLvlUpPopup(
   description = "",
   buttonText = "",
   onClickConfirm = null,
) {
   const asset = AssetContainer.ins;
   const pref = asset.lvlUpDialogPref;

   let node = cc.instantiate(pref)
   node.setParent(cc.director.getScene().getChildByName('Canvas'))
   node.setPosition(cc.v2(0, 0))
   Utils.fadeInNode(node);

   let script = node.getComponent(LevelUpPopup)

   script.descriptionLb.string = description;
   script.confirmBtnTextLb.string = buttonText;
   script.onConfirm = onClickConfirm;

   return script
}