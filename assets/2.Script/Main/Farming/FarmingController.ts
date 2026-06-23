import { time } from "console";
import { CONFIG } from "../../Config/Config";
import AnimationOnEnable from "../../Helper/AnimationOnEnable";
import Drawer from "../../Helper/Drawer";
import { callFloatingText } from "../../Helper/FloatingText";
import { GlobalVar } from "../../Helper/GlobalVar";
import Utils from "../../Helper/Utils";
import MainCtrl from "../MainCtrl";
import Floor from "./Floor";
import PlantHarvestUI from "./planting-ui/PlantHarvestUI";
import PlantInteractUI from "./planting-ui/PlantInteractUI";
import Slot from "./Slot";
import { SEED_ID_TO_SPRITE_FRAME_INDEX } from "../AssetContainer";
import { callTextNotification, TextNotificationBGColor } from "../../Notification/TextNotification";
import GardenFloorBuilder from "../GardenFloorBuilder/GardenFloorBuilder";

const { ccclass, property } = cc._decorator;

const SEED_ID_TO_SPRITE_INDEX = {
   '9001': 0,
   '9002': 1,
   '9003': 2,
}

@ccclass
export default class FarmingController extends cc.Component {
   public static ins: FarmingController = null;

   @property(GardenFloorBuilder) gardenFloorBuilder: GardenFloorBuilder = null;

   protected onLoad(): void {
      FarmingController.ins = this; 
   } 

   protected onDestroy(): void { FarmingController.ins = null; }
} 