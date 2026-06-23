import Drawer from "../Helper/Drawer";
import FloorViewManager from "./FloorViewManager";
import SlotInteractionUIManager from "./Farming/SlotInteractionUI/SlotInteractionUIManager";

const { ccclass, property } = cc._decorator;

export enum GARDEN_BG_EVENTS {
   CLICK_START = "CLICK_START",
   CLICK_MOVE = "CLICK_MOVE",
   CLICK_END = "CLICK_END",
}
@ccclass
export default class GardenBackground extends cc.Component {
   static eventInstance = new cc.EventTarget();

   public static ins: GardenBackground = null;
   touchStartPos: any = {};

   currentMouseScrollY = null;
   scrollY = 0;

   protected onLoad(): void {
      this.node.on(cc.Node.EventType.TOUCH_START, (touchEvent: cc.Event.EventTouch) => {
         GardenBackground.eventInstance.emit(GARDEN_BG_EVENTS.CLICK_START, touchEvent);


         this.onTouchStart(touchEvent);
      }, this);

      this.node.on(cc.Node.EventType.TOUCH_MOVE, (touchEvent: cc.Event.EventTouch) => {
         GardenBackground.eventInstance.emit(GARDEN_BG_EVENTS.CLICK_MOVE, touchEvent);

         this.onTouchMove(touchEvent);
      }, this);

      this.node.on(cc.Node.EventType.TOUCH_END, (touchEvent: cc.Event.EventTouch) => {
         GardenBackground.eventInstance.emit(GARDEN_BG_EVENTS.CLICK_END, touchEvent);


         this.onTouchEnd(touchEvent);
      }, this);


      this.node.on(cc.Node.EventType.MOUSE_WHEEL, (evt: cc.Event.EventMouse) => {

         if (this.currentMouseScrollY == null) {
            this.currentMouseScrollY = evt.getScrollY();
         } else {
            if (Math.abs(evt.getScrollY()) >= 200) {
               if (evt.getScrollY() > 0) {
                  FloorViewManager.ins.moveUp(Math.round(Math.abs(evt.getScrollY()) / 200));
               } else {
                  FloorViewManager.ins.moveDown(Math.round(Math.abs(evt.getScrollY()) / 200));
               }
            }
         }
      }, this);

      this.node.on(cc.Node.EventType.MOUSE_MOVE, (event: cc.Event.EventMouse) => {
         const hand = SlotInteractionUIManager.ins.harvestHandIcon;
         hand.active = false;
      }, this);

      GardenBackground.ins = this;
   }

   onTouchStart(touch: cc.Event.EventTouch) {
      this.touchStartPos[touch.getID()] = touch.getLocation();

      // console.log(`BG onTouchStart`);

   }

   onTouchMove(touch: cc.Event.EventTouch) {
      // console.log(`BG onTouchMove`);
      let touchPos = touch.getLocation();
      let touchStartPos = this.touchStartPos[touch.getID()];
      if (touchStartPos) {
         const dragYDis = touchStartPos.y - touchPos.y;

         // console.log(dragYDis);

         // Drawer.clear(`123`);

         if (dragYDis > 170) {
            this.touchStartPos[touch.getID()] = touchPos;

            // Drawer.drawLine(touchStartPos, touchPos, cc.Color.GREEN, 4, '123');

            FloorViewManager.ins.moveUp();
         } else if (dragYDis < -170) {
            this.touchStartPos[touch.getID()] = touchPos;

            // Drawer.drawLine(touchStartPos, touchPos, cc.Color.GREEN, 4, '123');

            FloorViewManager.ins.moveDown();
         } else {
            // Drawer.drawLine(touchStartPos, touchPos, cc.Color.RED, 4, '123');

         }
      }
   }

   onTouchEnd(touch: cc.Event.EventTouch) {
      // console.log(`BG onTouchEnd`);
      this.touchStartPos[touch.getID()] = null;

      Drawer.clear(`123`);
   }

   protected onDestroy(): void {
      GardenBackground.ins = null;
   }
}
