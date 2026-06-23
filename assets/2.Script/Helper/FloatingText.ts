import AssetContainer from "../Main/AssetContainer"
import Utils from "./Utils";

export function callFloatingText(
   textString = '',
   worldPosition = cc.v2(0, 0),
   existTime = 1,
   offset = 100,
   fontSize = 45,
   opts = {},
   onComplete = null,
   color = cc.Color.WHITE,
   outlineColor = new cc.Color().fromHEX(`#000000AA`),
   outlineWidth = 4) {
   const asset = AssetContainer.ins;
   const pref = asset.floatingTextPref;

   const node = cc.instantiate(pref)
   node.setParent(cc.director.getScene().getChildByName('Canvas'));

   const localizedWPos = Utils.worldSpaceToLocal(worldPosition, node.parent);

   node.setPosition(localizedWPos);
   node.color = color;
   cc.tween(node).to(existTime, { opacity: 0, y: node.y + offset }, opts).call(() => { onComplete?.(); }).start();

   const lb = node.getComponent(cc.Label);

   lb.string = textString;
   lb.fontSize = fontSize;

   const outline = node.getComponent(cc.LabelOutline);
   outline.color = outlineColor;
   outline.width = outlineWidth;
}