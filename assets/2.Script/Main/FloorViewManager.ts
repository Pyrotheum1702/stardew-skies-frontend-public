import { GlobalVar } from "../Helper/GlobalVar";
import { floorsYOffset } from "./GardenFloorBuilder/GardenFloorBuilder";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FloorViewManager extends cc.Component {
   public static ins: FloorViewManager = null;

   @property(cc.Node) gardenContainer: cc.Node = null;

   currentFloorIndex = 0;
   blockAllAction = false;

   protected onLoad(): void {
      FloorViewManager.ins = this;

   }

   onMouseScroll(event) {
      const scrollY = event.getScrollY();
      console.log('Mouse wheel scrolled:', scrollY);
   }

   onClickMoveUp() { this.moveUp(1); };
   moveUp(count = 1) {
      if (this.blockAllAction) return;
      if (this.currentFloorIndex == GlobalVar.garden.floors.length) return;

      const nextFloorIndex = Math.min(GlobalVar.garden.floors.length - 1, this.currentFloorIndex + count);
      const dif = Math.abs(this.currentFloorIndex - nextFloorIndex);
      if (nextFloorIndex < GlobalVar.garden.floors.length) {
         this.blockAllAction = true;

         this.currentFloorIndex = nextFloorIndex;
         cc.tween(this.gardenContainer).to(0.3, { y: this.gardenContainer.y - (floorsYOffset * dif) }, { easing: 'sineOut' }).call(() => {
            this.blockAllAction = false;
         }).start();
      }
   }

   onClickMoveDown() { this.moveDown(1); };
   moveDown(count = 1) {
      if (this.blockAllAction) return;
      if (this.currentFloorIndex == GlobalVar.garden.floors.length) return;

      const nextFloorIndex = Math.max(0, this.currentFloorIndex - count);
      const dif = Math.abs(this.currentFloorIndex - nextFloorIndex);
      if (nextFloorIndex >= 0) {
         this.blockAllAction = true;

         this.currentFloorIndex = nextFloorIndex;
         cc.tween(this.gardenContainer).to(0.3, { y: this.gardenContainer.y + (floorsYOffset * dif) }, { easing: 'sineOut' }).call(() => {
            this.blockAllAction = false;
         }).start();
      }
   }

   protected onDestroy(): void {
      FloorViewManager.ins = null;
   }
}
