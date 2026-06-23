import AssetContainer from "../../Main/AssetContainer";
import Utils from "../Utils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingDialog extends cc.Component {
   onEndCall = null
   existTime = 1
   protected update(dt: number): void {
      if (this.existTime > 0) {
         this.existTime -= dt
         if (this.existTime < 0) this.endImmediately(true)
      }
   }

   endImmediately(callCallback = false) {
      this.existTime = -1
      cc.Tween.stopAllByTarget(this.node)
      Utils.fadeOutNode(this.node, 0.25, () => { if (callCallback && this.onEndCall) this.onEndCall(); this.node.destroy() })
   }
}

export function callLoadingDialog(existTime = 5, callBackOnEnd = null): LoadingDialog {
   const asset = AssetContainer.ins
   const pref = asset.loadingDialogPref

   let dialog = cc.instantiate(pref)
   dialog.setParent(cc.director.getScene().getChildByName('Canvas'))
   dialog.setPosition(cc.v2(0, 0))
   Utils.fadeInNode(dialog)

   let script = dialog.getComponent(LoadingDialog)
   script.existTime = existTime
   script.onEndCall = callBackOnEnd
   return script
}

export function callInvisibleLoadingDialog(existTime = 5, callBackOnEnd = null): LoadingDialog {
   const asset = AssetContainer.ins
   const pref = asset.loadingDialogPref

   let dialog = cc.instantiate(pref)
   dialog.setParent(cc.director.getScene().getChildByName('Canvas'))
   dialog.setPosition(cc.v2(0, 0))
   // Utils.fadeInNode(dialog)
   dialog.active = true;
   dialog.opacity = 0;

   let script = dialog.getComponent(LoadingDialog)
   script.existTime = existTime
   script.onEndCall = callBackOnEnd
   return script
}
