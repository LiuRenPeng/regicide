<template>
  <div class="tablecloth">
    <div class="castle">
      <Card v-for="(card) in castleCardList" :key="card" :code="card" :scale="cardSize"
        class="card-deck" />
      <div class="castle-bar">
        <div class="hurt-num">{{bossAtk}}</div>
        <div class="hp-bar">
          <div class="hp-bar-content" 
            :style="{width: `${Math.floor(Math.max(bossHP, 0)/bossMaxHP*100)}%`}"></div>
        </div>
        <div class="hp-num">{{bossHP}}</div>
      </div>
    </div>
    <div class="rule1"></div>
    <div class="rule2"></div>
    <div class="tavern">
      <Card v-for="(card, index) in tavernCardList" :key="card" :code="card" :scale="miniCardSize" back
        class="card-deck" :style="{left: `${index}px`}" />
    </div>
    <div class="discard">
      <Card v-for="(card, index) in discardList" :key="card" :code="card" :scale="miniCardSize" back
        class="card-deck" :style="{left: `${index}px`}" />
      <!-- <div class="card-list" v-for="card in discardList" :key="card" >
        <Card :code="card" :scale="microCardSize"/>
      </div> -->
    </div>
    <div :class="`btn-pass ${allowPass? '' : 'disable'}`">跳过</div>
    <div v-if="stage === 4" class="btn-play" @click="handleDiscard">
      弃牌
    </div>
    <div v-else :class="`btn-play ${allowPlay? '' : 'disable'}`" @click="handlePlayCard">
      出牌
    </div>
    <div class="handcard">
      <div class="stage">{{stageMsg}}</div>
      <Card v-for="(card) in handCardList" :key="card" :code="card" :scale="cardSize"
        :class="`card-play ${selectCardList.includes(card)? 'selected' : ''}`" @click="handleSelectCard(card)" />
    </div>
    <Modal v-if="showModal" :msg="modalMsg" @clickBtn="startGame" />
  </div>
</template>

<script>
import Card from '@/components/Card.vue';
import Modal from '@/components/Modal.vue';
export default {
  name: "App",
  components: {
    Card,
    Modal
  },
  props: {
    player: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      cardSize: document.documentElement.clientWidth / 1920,
      miniCardSize: document.documentElement.clientWidth / 1920 * 0.5,
      microCardSize: document.documentElement.clientWidth / 1920 * 0.25,
      colorList: ['club', 'diamond', 'hearts', 'spade'],
      castleCardList: [], // 所有牌堆数组都是左为底，右为顶
      handCardMax: 0,
      handCardList: [],
      selectCardList: [],
      discardList: [],
      tavernCardList: [],
      allowPass: true,
      allowPlay: false,
      stage: 1, // 游戏阶段：1出牌阶段，2发动技能阶段，3造成伤害阶段，4承受伤害阶段
      stageMsg: '出牌阶段',
      bossAtk: 10,
      shouldDiscardCount: 0, // 应该弃掉的点数
      withstandBoss: 0,
      bossMaxHP: 20,
      bossHP: 20,
      modalMsg: '',
      showModal: false
    };
  },
  created(){
    this.gameInit();
  },
  watch: {
    // 抵抗boss攻击
    withstandBoss(val){
      this.bossAtk = Math.max(this.bossAtk - val, 0);
    },
    stage(val){
      if(val === 1){
        this.stageMsg = '出牌阶段';
      } else if(val === 2){
        this.stageMsg = '造成伤害';
      } else if(val === 4) {
        this.stageMsg = `弃牌承受伤害: 还需弃掉${this.shouldDiscardCount}点`;
        if(this.handCardList.length === 0){
          this.gameover();
        }
      }
    },
    // shouldDiscardCount(val){
    //   if(val <= 0){
    //     console.log('重置弃牌点数')
    //     this.stage = 1;
    //   }
    // }
  },
  methods: {
    // 游戏设置初始化
    gameInit(){
      this.initCastleList();
      this.initTavernList();
      // 根据玩家数设置手牌上限
      this.handCardMax = this.player === 4 ? 5 : (this.player === 3 ? 6 : (this.player === 2 ? 7 : 8));
      this.initHandList(this.handCardMax);
      this.stage = 1;
      this.resetHP();
    },
    // 洗牌算法
    shuffle(arr){
      const res = [...arr];
      for (let i = 0; i < res.length; i++) {
        const random = Math.floor(Math.random() * (i + 1));
        [res[i], res[random]] = [res[random], res[i]];
      }
      return res;
    },
    // 拼接花色和点数
    getColorCount(counts) {
      const res = [];
      counts.forEach(count => {
        this.shuffle(this.colorList).forEach(color => {
          res.push(`${color}-${count}`)
        })
      })
      return res;
    },
    // 城堡BOSS卡牌初始化
    initCastleList() {
      const countList = [13,12,11];
      this.castleCardList = this.getColorCount(countList);
    },
    // 酒馆卡牌初始化
    initTavernList() {
      const countList = [1,2,3,4,5,6,7,8,9,10];
      let cardList = this.getColorCount(countList);
      // 是否添加小丑卡牌
      if (this.player === 4){
        cardList.concat(['joker-1', 'joker-2'])
      } else if (this.player === 3){
        cardList.concat(['joker-1'])
      }
      this.tavernCardList = this.shuffle(cardList);
    },
    // 抓牌
    drawCards(num){
      for(let i=0; i<num; i++) {
        this.handCardList.push(this.tavernCardList.pop());
      }
    },
    // 手牌初始化
    initHandList(cardNum) {
      this.drawCards(cardNum);
    },
    // 选择手牌
    handleSelectCard(card){
      // 出牌阶段和弃牌阶段才能选择手牌
      if (this.stage === 1 || this.stage === 4) {
        // 选中和取消选中逻辑
        if(this.selectCardList.includes(card)){
          this.selectCardList = this.selectCardList.filter(item => item !== card);
        } else {
          this.selectCardList.push(card);
        }
        if(this.stage === 1){
          // 出牌阶段进行合法性校验
          this.allowPlay = this.ruleCheck(this.selectCardList);
        } else {
          // 弃牌阶段进行弃牌点数校验
          // this.allowPlay = this.discardCheck(this.selectCardList);
        }
      }
    },
    // 卡牌点数处理
    getCount(count){
      if(count === '11') return 10;
      if(count === '12') return 15;
      if(count === '13') return 20;
      return parseInt(count);
    },
    // 获取卡牌点数list
    getCountList(cards) {
      return cards.map(card => {
        return this.getCount(card.split('-')[1]);
      });
    },
    // 出牌合法性校验
    ruleCheck(cards){
      if(!cards.length) return false;
      if(cards.length > 1){
        const colors = cards.map(card => card.split('-')[0]);
        const counts = this.getCountList(cards);
        // joker只能单独打出
        if (colors.includes('joker')) return false;
        // 存在1卡牌
        if (counts.includes(1)){
          // 只存在一张非1卡牌
          if (counts.filter(count => count !== 1).length === 1) return true;
          return false;
        } else {
          // 不存在1卡牌
          // 连招且总点数不得超过10点
          if (counts.filter(count => count !== counts[0]).length === 0 && 
              counts.reduce((a,b) => a + b, 0) <= 10) return true;
          return false;
        }
      }
      return true;
    },
    // 弃牌点数校验
    // discardCheck(cards){
    //   if(!cards.length) return false;
    //   return true;
    // },

    // 出牌
    handlePlayCard(){
      if(this.allowPlay) {
        this.handCardList = this.handCardList.filter(card => {
          return !this.selectCardList.includes(card)
        });
        this.allowPlay = false;
        // 进入伤害和发动技能阶段
        this.stage = 2;
        this.computedHurt(this.selectCardList);
        this.selectCardList = [];
      }
    },
    // 弃牌
    handleDiscard(){
      this.handCardList = this.handCardList.filter(card => {
        return !this.selectCardList.includes(card)
      });
      this.discardList.push(...this.selectCardList);
      // 计算扣除弃牌点数
      const discardCount = this.selectCardList.reduce((total, card) => {
        const [color, count] = card.split('-');
        if(color === 'joker') return total;
        return total + this.getCount(count);
      }, 0);
      this.shouldDiscardCount = this.shouldDiscardCount - discardCount;
      this.allowPlay = this.handCardList.length > 0;
      if(!this.handCardList.length && this.shouldDiscardCount > 0){
        // 手牌弃光仍不够抵扣点数则游戏失败
        this.gameover();
      }
      if(this.shouldDiscardCount <= 0){
        this.stage = 1;
      } else {
        this.stageMsg = `弃牌承受伤害：还需弃掉${this.shouldDiscardCount}点`;
      }
      this.selectCardList = [];
    },
    // 对boss造成伤害
    hurtBoss(hurt){
      this.bossHP =this.bossHP - hurt, 0;
    },
    // 检查boss血量
    checkBossHP(){
      if(this.bossHP > 0){
        this.shouldDiscardCount = this.bossAtk;
        if(this.shouldDiscardCount === 0){
          console.log('boss攻击力降为0，跳过弃牌阶段，进入新的出牌阶段')
          this.stage = 1;
        } else {
          console.log('boss未被消灭，进入弃牌阶段')
          this.stage = 4;
          this.stageMsg = `弃牌承受伤害: 还需弃掉${this.shouldDiscardCount}点`;
        }
      } else {
        if (this.bossHP === 0){
          // 感化boss，加入到酒馆牌堆
          console.log('感化BOSS')
          this.stageMsg = '感化BOSS'
          this.tavernCardList.push(this.castleCardList.pop());
        } else {
          // 消灭boss，移除到弃牌堆
          console.log('消灭BOSS')
          this.stageMsg = '消灭BOSS'
          this.discardList.push(this.castleCardList.pop());
        }
        // 刷新下一个boss
        if(this.castleCardList.length) {
          setTimeout(() => {
            console.log('boss上新')
            this.resetHP();
            this.stage = 1;
            this.stageMsg = '出牌阶段';
          }, 600);
        } else {
          // 游戏胜利
          this.gameover(1);
        }
        this.withstandBoss = 0;
      }
    },
    // 结算
    computedHurt(cards){
      const counts = this.getCountList(cards);
      const hurt = counts.reduce((a,b) => a + b, 0);
      console.log('造成伤害：',hurt)
      this.hurtBoss(hurt);
      // 发动技能
      const colors = Array.from(new Set(cards.map(card => card.split('-')[0])));
      // 筛选出有效技能
      const effectSkills = colors.filter(skill => this.skillCheck(colors, skill));
      effectSkills.forEach((skill, index) => {
        setTimeout(() => {
          this.stage = 3;
          this.startSkill(skill, hurt);
          // 最后一个技能释放完毕
          if (index === effectSkills.length - 1) {
            setTimeout(() => {
              console.log('所有技能已释放完毕');
              this.checkBossHP();
            }, 800);
          }
        }, 800*index);
      })
    },
    // 技能生效检查
    skillCheck(colors, skill){
      const hasJoker = colors.includes('joker');
      const bossColor = this.castleCardList[this.castleCardList.length-1].split('-')[0];
      if(colors.includes(skill)){
        if(bossColor !== skill) return true;
        if(hasJoker) return true;
        return false;
      }
      return false;
    },
    // 发动技能
    startSkill(skill, count){
      switch (skill) {
        case 'hearts':
          this.startHeartsSkill(count);
          break;
        case 'diamond':
          this.startDiamondSkill(count);
          break;
        case 'club':
          this.startClubSkill(count);
          break;
        case 'spade':
          this.startSpadeSkill(count);
          break;
        default:
          break;
      }
    },
    // 红桃牌效果：从弃牌堆恢复等数量的牌到酒馆牌堆
    startHeartsSkill(count){
      this.stageMsg = `发动红桃效果：恢复${count}张牌到酒馆`;
      console.log(`发动红桃效果：恢复${count}张牌到酒馆`)
      // 洗混牌堆
      this.discardList = this.shuffle(this.discardList);
      // 从弃牌堆顶部抽出卡片放入酒馆牌堆底
      for(let i=0; i<count; i++){
        if(this.discardList.length){
          this.tavernCardList.unshift(this.discardList.pop())
        }
      }
    },
    // 方块牌效果：从酒馆牌堆抽等数量的卡到手牌中（多人则依次抽牌，总和为该点数）
    startDiamondSkill(count){
      this.stageMsg = `发动方片效果：抽取${count}张牌到手牌`;
      console.log(`发动方片效果：抽取${count}张牌到手牌`)
      for(let i=0; i<count; i++){
        if(this.tavernCardList.length && this.handCardList.length < this.handCardMax){
          this.handCardList.push(this.tavernCardList.pop())
        }
      }
    },
    // 梅花牌效果：双倍伤害
    startClubSkill(count){
      this.stageMsg = `发动梅花效果：造成双倍伤害`;
      console.log(`发动梅花效果：造成双倍伤害`)
      this.hurtBoss(count);
    },
    // 黑桃牌效果：抵挡伤害
    startSpadeSkill(count){
      this.stageMsg = `发动黑桃效果：抵挡${count}点伤害`;
      console.log(`发动黑桃效果：抵挡${count}点伤害`)
      this.withstandBoss = this.withstandBoss + count;
    },
    // 重置boss血条
    resetHP(){
      const bossCount = this.castleCardList[this.castleCardList.length-1].split('-')[1];
      if (bossCount == 11){
        this.bossAtk = 10;
        this.bossMaxHP = 20;
        this.bossHP = 20;
      } else if (bossCount == 12){
        this.bossAtk = 15;
        this.bossMaxHP = 30;
        this.bossHP = 30;
      } else {
        this.bossAtk = 20;
        this.bossMaxHP = 40;
        this.bossHP = 40;
      }
    },
    // 游戏结束
    gameover(win){
      if(win){
        this.modalMsg = '恭喜你，闯关成功！'
      } else {
        this.modalMsg = '闯关失败，少侠请重新来过。'
      }
      this.showModal = true;
    },
    startGame(){
      console.log('点击重新开始按钮');
      this.showModal = false;
      this.gameInit();
    }
  }
};
</script>

<style lang="less">
  @import './index.less';
</style>
