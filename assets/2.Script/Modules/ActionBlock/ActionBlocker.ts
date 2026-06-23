import Utils from "../../Helper/Utils";
import AssetContainer from "../../Main/AssetContainer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActionBlocker extends cc.Component {
   blockAllAction = false;

   remove() {
      if (this.blockAllAction) return;
      this.blockAllAction = true;

      Utils.fadeOutNode(this.node, 0.25, null, true);
   }
}

export function callActionBlocker() {
   const asset = AssetContainer.ins;
   const pref = asset.actionBlocker;

   let node = cc.instantiate(pref);
   node.setParent(cc.director.getScene().getChildByName('Canvas'));
   node.setPosition(0, 0);
   Utils.fadeInNode(node);

   let script = node.getComponent(ActionBlocker);
   return script;
}