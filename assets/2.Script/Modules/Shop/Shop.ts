import ShopItem from "./ShopItem";
import Utils from "../../Helper/Utils";
import { REQUEST_OPERATION, CONFIG } from "../../Config/Config";
import { GlobalVar } from "../../Helper/GlobalVar";
import AssetContainer from "../../Main/AssetContainer";
import GardenAssetManager from "../../Main/Farming/GardenAssetManager";
import { SERVER_DYNAMIC_CONFIGURATIONS } from "../../Main/Item";
import ItemInformationPanel from "./ItemInformationPanel";
import { callTextNotification, TextNotificationBGColor } from "../../Notification/TextNotification";

const { ccclass, property } = cc._decorator;

export enum SHOP_PAGE {
   SEED = 0,
   POT = 1,
   FERTILIZER = 2,
}

@ccclass
export default class Shop extends cc.Component {
   @property(cc.Node) shopUIOverlay: cc.Node = null;
   @property(cc.Node) shopUIContainer: cc.Node = null;


   @property(cc.Node) nextBtn: cc.Node = null;
   @property(cc.Node) previousBtn: cc.Node = null;

   @property(cc.Label) coinBalanceLb: cc.Label = null;
   @property(cc.Label) tokenBalanceLb: cc.Label = null;

   @property(cc.Node) pageContentLayout: cc.Node = null;
   @property(cc.Node) pageContentContainer: cc.Node = null;

   @property([cc.Node]) tabBtns: cc.Node[] = [];

   @property([cc.Node]) shopHorzContainerLayouts: cc.Node[] = [];

   @property(cc.Prefab) shopItemPref: cc.Prefab = null;
   // @property(cc.Prefab) shopSeedItemPref: cc.Prefab = null;
   @property(cc.Prefab) pageLoadingPref: cc.Prefab = null;

   @property(cc.Prefab) itemInfoPanelPref: cc.Prefab = null;

   @property([cc.SpriteFrame]) propertySprFrames: cc.SpriteFrame[] = [];

   rowCount = 2;
   rowLength = 4;
   blockAllAction = false;

   currentPageIndex = 0;
   currentPageData: any = {};
   currentPage = SHOP_PAGE.SEED;
   currentItemPanel: ItemInformationPanel = null;

   private static ins: Shop = null;
   public static get Instance(): Shop {
      if (Shop.ins == null) {
         const asset = AssetContainer.ins;

         let newShopNode = cc.instantiate(asset.shopPref);
         newShopNode.setParent(asset.canvas)
         newShopNode.setPosition(0, 0);

         Shop.ins = newShopNode.getComponent(Shop);
         Shop.ins.hideShopImmediately();
      }

      return Shop.ins;
   }

   reloadPage() {
      for (let i = 0; i < this.tabBtns.length; i++) {
         let tabBtn = this.tabBtns[i];
         if (i == this.currentPage) {
            tabBtn.opacity = 255;
            tabBtn.getComponent(cc.Button).interactable = false;
         } else {
            tabBtn.opacity = 150;
            tabBtn.getComponent(cc.Button).interactable = true;
         }
      }

      this.blockAllAction = true;

      const page = this.currentPage;
      this.shopHorzContainerLayouts.forEach(container => {
         container.removeAllChildren(true);
      })

      // this.pageContentContainer.removeAllChildren(true);

      let pageLoading = cc.instantiate(this.pageLoadingPref);
      pageLoading.setParent(this.pageContentContainer);
      pageLoading.setPosition(0, 0);
      pageLoading.opacity = 0;

      this.scheduleOnce(() => {
         if (cc.isValid(pageLoading)) Utils.fadeInNode(pageLoading);
      }, 0.2);

      Utils.sendRequest({
         operation: REQUEST_OPERATION.GET_SHOP,
         page: page,
      }, (response) => {
         const shopData = response.shopData;

         // console.log({ shopData });

         if (shopData == null) { if (cc.isValid(pageLoading)) Utils.fadeOutNode(pageLoading, 0.25, null, true); return; }

         const pageData = shopData.currentPage;
         if (pageData == null) { if (cc.isValid(pageLoading)) Utils.fadeOutNode(pageLoading, 0.25, null, true); return; }

         if (cc.isValid(pageLoading)) Utils.fadeOutNode(pageLoading, 0.25, null, true);

         this.currentPageData = pageData;
         this.setCurrentPageIndex(0);

         this.blockAllAction = false;
      }, (error) => {
         console.error({ error });

         callTextNotification(4, error?.message || "Unknown error!", TextNotificationBGColor.RED)

         this.blockAllAction = false;
      })
   }

   setCurrentPageIndex(index) {
      this.currentPageIndex = index;

      let pageItemCount = this.rowCount * this.rowLength;
      let startPageIndex = pageItemCount * this.currentPageIndex;
      let pageDataArray = Object.values(this.currentPageData);
      let totalPageCount = Math.floor(pageDataArray?.length / pageItemCount);

      this.nextBtn.opacity = (index < totalPageCount) ? 255 : 150;
      this.nextBtn.getComponent(cc.Button).interactable = (index < totalPageCount) ? true : false;

      this.previousBtn.opacity = (index > 0) ? 255 : 150;
      this.previousBtn.getComponent(cc.Button).interactable = (index > 0) ? true : false;

      const pageData = [];

      for (let i = startPageIndex; i < startPageIndex + pageItemCount; i++) {
         const itemData = pageDataArray[i];
         if (itemData) pageData.push(itemData);
      }

      this.renderPageData(pageData);
   }

   renderPageData(data) {
      if (this.pageContentLayout.active == false) Utils.fadeInNode(this.pageContentLayout);
      // console.log({ data });

      const ITEMS = SERVER_DYNAMIC_CONFIGURATIONS.ITEMS;

      this.shopHorzContainerLayouts.forEach(container => { container.removeAllChildren(true); });

      let index = 0;
      let row = 0;
      let targetItemContainer = this.shopHorzContainerLayouts[row];

      const moveNextIndex = () => {
         index += 1;
         if (index >= this.rowLength) {
            row += 1; index = 0;
            if (row >= this.rowCount) row = 0;
            targetItemContainer = this.shopHorzContainerLayouts[row];
         }
      }

      for (let i = 0; i < data.length; i++) {
         const itemData = data[i];
         const ITEM = ITEMS[itemData.itemID];

         let item = cc.instantiate(this.shopItemPref);
         item.setParent(targetItemContainer);
         item.x = 0;

         const itemScript = item.getComponent(ShopItem);

         itemScript.nameLb.string = itemData.name;
         itemScript.costLb.string = `Buy: ${itemData.cost}`;

         itemScript.costIconSprs.forEach(spr => { spr.spriteFrame = GardenAssetManager.ins.coin50SprFrame; });

         let clickable = true;
         item.opacity = (itemData.cost > 0) ? 255 : 150;

         if (ITEM.levelRequirement != null && GlobalVar.profile.level < ITEM.levelRequirement) {
            item.opacity = 150;
            itemScript.costLb.string = `Level: ${ITEM.levelRequirement}`;
            itemScript.costIconSprs[0].node.parent.active = false;
            clickable = false;
            itemScript.costIconSprs.forEach(spr => { spr.spriteFrame = GardenAssetManager.ins.lockSprFrame; });
         }

         if (itemData.cost <= 0) {
            itemScript.costLb.string = `Locked`;
            clickable = false;
            itemScript.costIconSprs.forEach(spr => { spr.spriteFrame = GardenAssetManager.ins.lockSprFrame; });
         }

         switch (this.currentPage) {
            case SHOP_PAGE.SEED: {
               itemScript.itemIconSprs.forEach(spr => { spr.spriteFrame = GardenAssetManager.ins.plantMaturedSprFrames[ITEM.spriteIndex || 0]; })
               break;
            } case SHOP_PAGE.POT: {
               itemScript.itemIconSprs.forEach(spr => { spr.spriteFrame = GardenAssetManager.ins.potSprFrames[ITEM.spriteIndex || 0]; })
               break;
            } case SHOP_PAGE.FERTILIZER: {
               itemScript.itemIconSprs.forEach(spr => { spr.spriteFrame = GardenAssetManager.ins.fertilizerSprFrames[ITEM.spriteIndex || 0]; })
               break;
            }
         }

         if (clickable) itemScript.onClickCallback = () => {
            this.blockAllAction = true;
            // cc.tween(this.shopUIContainer).to(0.25, { opacity: 150 }, { easing: 'sineIn' }).start();
            const infoPanel = cc.instantiate(this.itemInfoPanelPref);
            infoPanel.setParent(this.node);
            infoPanel.setPosition(0, 0);

            const infoPanelScript = infoPanel.getComponent(ItemInformationPanel);
            infoPanelScript.initData(itemData, this.currentPage);
            infoPanelScript.onExitCallback = () => {
               // cc.tween(this.shopUIContainer).to(0.25, { opacity: 255 }, { easing: 'sineOut' }).start();
               this.blockAllAction = false;
            }

            this.currentItemPanel = infoPanelScript;
         }

         moveNextIndex();
      }
   }

   onClickNextPageIndex() {
      if (this.blockAllAction) return;
      this.setCurrentPageIndex(this.currentPageIndex + 1);
   }

   onClickPreviousPageIndex() {
      if (this.blockAllAction) return;
      this.setCurrentPageIndex(this.currentPageIndex - 1);
   }

   showShop() {
      this.blockAllAction = true;
      if (this.shopUIContainer.active == false) Utils.fadeInNode(this.shopUIContainer, 0.25, () => {
         this.blockAllAction = false;
      });

      this.reloadPage();
   }

   hideShop() {
      if (this.blockAllAction) return;
      this.blockAllAction = true;

      if (this.shopUIContainer.active == true) Utils.fadeOutNode(this.shopUIContainer, 0.25, () => { });
      this.scheduleOnce(() => { this.blockAllAction = false; }, 0.25);
      if (this.currentItemPanel) this.currentItemPanel.onClickExit();
   }

   hideShopImmediately() {
      this.shopUIContainer.active = false;
   }

   protected onLoad(): void {
      this.shopUIOverlay.on(cc.Node.EventType.TOUCH_END, this.onClickShopOverlayBackground, this)
      cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event) => {
         if (event.keyCode === cc.macro.KEY.escape) this.hideShop();
      }, this);
   }

   onClickShopOverlayBackground() {
      this.hideShop();
   }

   onClickPage(evt, CED) {
      if (this.blockAllAction) return;
      const pageIndex = parseInt(CED);

      if (pageIndex == this.currentPage) return;

      switch (pageIndex) {
         case SHOP_PAGE.SEED: { break; }
         case SHOP_PAGE.POT: { break; }
         case SHOP_PAGE.FERTILIZER: { break; }
         default: { return; }
      }

      this.currentPage = pageIndex;
      this.reloadPage();
   }

   protected onDestroy(): void {

   }
}
