// Scenes describe intentional little tasks. Durations are milliseconds, positions are lane fractions.
const beat=(pose,ms=800,extra={})=>({pose,ms,...extra});
export const scenes=Object.freeze({
 SCREEN_CHECK:{contexts:['ENTRY_B','ENTRY_C','WORKBENCH','TRUSTAI','GDSC'],cooldown:35000,steps:[beat('laptop-closed',650),beat('laptop',1100,{micro:'type'}),beat('think',850,{micro:'double-take'}),beat('laptop',1100,{micro:'type'}),beat('look-up',600),beat('laptop-closed',600),beat('stand',450)]},
 THINKING_LAP:{contexts:['ENTRY_A','ENTRY_B','ENTRY_C','WORKBENCH','ABOUT','PORTFOLIO','GDSC'],cooldown:42000,steps:[beat('think',800,{micro:'nod'}),beat('walk-right',1100,{move:'other'}),beat('look-left',650),beat('walk-left',1100,{move:'away'}),beat('think',700,{micro:'wrist-check'}),beat('pleased',600),beat('stand',450)]},
 STRETCH_RESET:{contexts:['ENTRY_A','ENTRY_B','ENTRY_C','WORKBENCH','ABOUT','CONTACT','FOOTER'],cooldown:45000,steps:[beat('hands-on-hips',700,{micro:'shoulder-roll'}),beat('stretch',1200,{micro:'breathe'}),beat('look-left',650),beat('look-right',650),beat('wave',700,{micro:'wave'}),beat('stand',450)]},
 DEVICE_CHECK:{contexts:['ENTRY_A','ENTRY_B','ENTRY_C','WORKBENCH','ABOUT','CONTACT','PORTFOLIO','GDSC','TRUSTAI'],cooldown:33000,steps:[beat('reach',500),beat('tablet',1100,{micro:'wrist-check'}),beat('curious',750,{micro:'double-take'}),beat('tablet',900,{micro:'prop-check'}),beat('pleased',650),beat('stand',500)]},
 CODE_THEN_THINK:{contexts:['ENTRY_B','WORKBENCH','GDSC','TRUSTAI'],cooldown:40000,steps:[beat('terminal',1000,{micro:'type'}),beat('think',800,{micro:'nod'}),beat('look-up',600),beat('terminal',1200,{micro:'type'}),beat('point',1000,{target:true}),beat('stand',450)]},
 MAP_DOUBLE_TAKE:{contexts:['ENTRY_A','GIS','WORKBENCH'],cooldown:38000,steps:[beat('map-fold',650),beat('map',1200,{micro:'double-take'}),beat('think',750),beat('map',900,{micro:'prop-check'}),beat('point',1100,{target:true}),beat('map-fold',650),beat('stand',450)]},
 COFFEE_PAUSE:{contexts:['ENTRY_A','ENTRY_B','ENTRY_C','ABOUT','FOOTER'],cooldown:48000,steps:[beat('reach',500),beat('coffee',900),beat('coffee',1800,{micro:'sip'}),beat('look-left',650),beat('coffee',850,{micro:'prop-check'}),beat('stand',450)]},
 PROJECT_NOTICE:{contexts:['PORTFOLIO','GDSC','TRUSTAI','GIS'],cooldown:26000,steps:[beat('look-up',650),beat('curious',700,{micro:'double-take'}),beat('walk-right',1100,{move:'other'}),beat('point',1100,{target:true}),beat('pleased',650),beat('stand',450)]},
 HELLO_AGAIN:{contexts:['ABOUT','CONTACT','FOOTER','LOST'],cooldown:38000,steps:[beat('peek-right',750),beat('walk-left',1100,{move:'away'}),beat('wave',1200,{micro:'wave'}),beat('hands-on-hips',700,{micro:'shoulder-roll'}),beat('point',1100,{target:true}),beat('stand',450)]},
 BOARD_PONDER:{contexts:['SIDE_QUESTS','ENTRY_A'],cooldown:38000,steps:[beat('game-piece',850,{micro:'prop-check'}),beat('think',1000),beat('crouch-inspect',850,{micro:'double-take'}),beat('game-piece',800),beat('pleased',750,{effect:'jump'}),beat('stand',500)]},

 EDUCATION_COMPARE:{contexts:['ABOUT'],requires:['school-quantic','school-uoft'],cooldown:65000,steps:[beat('document',900,{micro:'glance'}),beat('point',1100,{target:true,targetId:'school-quantic'}),beat('think',650),beat('point',1100,{target:true,targetId:'school-uoft'}),beat('document-tuck',650),beat('stand',450)]},
 GIS_TOOLKIT:{contexts:['WORKBENCH','GIS'],requires:['gis-tool'],cooldown:45000,steps:[beat('map-fold',650),beat('map',1000,{micro:'prop-check'}),beat('point',1100,{target:true,targetId:'gis-tool'}),beat('map',700),beat('map-fold',650),beat('stand',450)]},
 STACK_CHECK:{contexts:['WORKBENCH'],requires:['stack'],cooldown:40000,steps:[beat('look-up',650),beat('walk-right',900,{move:'other'}),beat('terminal',800,{micro:'type'}),beat('point',1100,{target:true,targetId:'stack'}),beat('think',600,{micro:'nod'}),beat('stand',450)]},
 SOURCE_CHECK:{contexts:['CONTACT','FOOTER','PORTFOLIO'],requires:['github'],cooldown:45000,steps:[beat('terminal',850,{micro:'type'}),beat('look-up',650),beat('point',1200,{target:true,targetId:'github'}),beat('wave',650),beat('stand',450)]},
 CLOUD_CONNECT:{contexts:['WORKBENCH'],requires:['azure-tool','oracle-tool'],cooldown:55000,steps:[beat('cable',800,{micro:'prop-check'}),beat('point',1000,{target:true,targetId:'azure-tool'}),beat('database',900),beat('point',1000,{target:true,targetId:'oracle-tool'}),beat('cable',650),beat('stand',450)]},
 CHAIR_BREAK:{contexts:['ENTRY_A','ENTRY_B','ENTRY_C','WORKBENCH','ABOUT','CONTACT','SIDE_QUESTS','FOOTER'],cooldown:30000,chair:true,steps:[
  beat('look-right',650,{chair:'available',face:'stow'}),beat('walk-right',1000,{move:'stow'}),beat('chair-grab',650,{chair:'grab'}),
  beat('chair-pull',1200,{move:'seat',chair:'pull'}),beat('chair-grab',600,{chair:'turn'}),beat('stand-to-sit',550,{chair:'sit-down'}),
  beat('chair-sit',850,{chair:'seated',micro:'weight'}),beat('chair-look',850,{micro:'glance'}),beat('chair-type',1000,{micro:'type'}),
  beat('chair-wave',850,{micro:'wave'}),beat('chair-think',700,{micro:'nod'}),beat('sit-to-stand',550,{chair:'stand-up'}),
  beat('stretch',750,{micro:'hand-adjust'}),beat('chair-push',1200,{move:'stow',chair:'push-back'}),beat('walk-left',1100,{move:'away',chair:'leave'}),beat('stand',600,{face:'target'})]},
 WORK_CHECK:{contexts:['ENTRY_B','WORKBENCH'],cooldown:20000,steps:[beat('look-up',650),beat('walk-right',1100,{move:'other'}),beat('reach',550),beat('cable',900,{micro:'prop-check'}),beat('terminal',900,{micro:'type'}),beat('database',850,{micro:'glance'}),beat('point',1100,{target:true}),beat('stand',500)]},
 MAP_DISCOVERY:{contexts:['ENTRY_A','WORKBENCH','GIS','PORTFOLIO'],cooldown:22000,steps:[beat('look-up',600),beat('walk-right',1000,{move:'other'}),beat('map-fold',650),beat('map',1100,{micro:'prop-check'}),beat('point',950,{target:true,targetId:'map'}),beat('map',900,{micro:'glance'}),beat('map-fold',600),beat('stand',450)]},
 RESUME_INSPECTION:{contexts:['ENTRY_A','ENTRY_C','RESUME','CONTACT'],cooldown:26000,steps:[beat('walk-right',1200,{move:'other'}),beat('document-tuck',650),beat('document',1000,{micro:'glance'}),beat('point',1100,{target:true,targetId:'resume'}),beat('handoff',800),beat('document-tuck',650),beat('stand',450)]},
 CONTACT_PLANE:{contexts:['CONTACT','FOOTER'],cooldown:24000,steps:[beat('walk-right',1000,{move:'other'}),beat('reach',500),beat('envelope',900,{micro:'prop-check'}),beat('point',950,{target:true,targetId:'email'}),beat('plane',800),beat('plane-release',800,{effect:'plane'}),beat('wave',900,{micro:'wave'}),beat('stand',450)]},
 REVERSI_MOVE:{contexts:['ENTRY_A','SIDE_QUESTS'],cooldown:28000,steps:[beat('walk-right',950,{move:'other'}),beat('crouch-inspect',850,{micro:'glance'}),beat('reach',500),beat('game-piece',900,{micro:'prop-check'}),beat('point',850,{target:true,targetId:'game'}),beat('pleased',750,{effect:'jump'}),beat('stand',550)]},
 TRUSTAI_REVIEW:{contexts:['ENTRY_C','TRUSTAI','PORTFOLIO'],cooldown:22000,steps:[beat('look-up',650),beat('walk-right',1100,{move:'other'}),beat('tablet',900,{micro:'glance'}),beat('terminal',850,{micro:'type'}),beat('think',700),beat('point',1000,{target:true,targetId:'live'}),beat('tablet',750,{micro:'prop-check'}),beat('stand',450)]},
 CAMERA_MOMENT:{contexts:['VISUALS','ABOUT'],cooldown:28000,steps:[beat('walk-right',950,{move:'other'}),beat('camera',650),beat('camera-up',950,{micro:'glance'}),beat('camera-review',1100,{micro:'prop-check'}),beat('point',1000,{target:true,targetId:'visuals'}),beat('camera',700),beat('stand',450)]},
 ARCHIVE_DISCOVERY:{contexts:['SIDE_QUESTS','FOOTER','PORTFOLIO'],cooldown:24000,steps:[beat('peek-right',850,{micro:'glance'}),beat('walk-right',1100,{move:'other'}),beat('crouch-inspect',700),beat('reach',550),beat('archive',1000,{micro:'prop-check'}),beat('point',1000,{target:true,targetId:'archive'}),beat('curious',650),beat('stand',450)]},
 THEME_REACTION:{contexts:['ENTRY_A','ENTRY_B','ENTRY_C','WORKBENCH','CONTACT','ABOUT','FOOTER'],cooldown:22000,steps:[beat('look-up',700),beat('hands-on-hips',800,{face:'opposite'}),beat('look-up',800,{micro:'glance'}),beat('point',1000,{target:true,targetId:'theme'}),beat('wave',700,{micro:'wave'}),beat('stand',500)]},
 PEEK_AND_POINT:{contexts:['ENTRY_A','ENTRY_C','SIDE_QUESTS','FOOTER','LOST'],cooldown:22000,steps:[beat('walk-right',1050,{move:'stow',edge:true}),beat('peek-left',800,{micro:'glance'}),beat('walk-left',1000,{move:'away'}),beat('shrug',700),beat('point',1100,{target:true}),beat('wave',800,{micro:'wave'}),beat('stand',450)]},
 WALK_AND_WAVE:{contexts:['ENTRY_A','ENTRY_B','ENTRY_C','WORKBENCH','ABOUT','CONTACT','PORTFOLIO','GDSC','TRUSTAI','GIS','VISUALS','FOOTER','LOST','SIDE_QUESTS'],cooldown:14000,steps:[beat('look-up',600,{face:'other'}),beat('walk-right',1300,{move:'other'}),beat('wave',800,{micro:'wave'}),beat('point',1000,{target:true}),beat('walk-left',1100,{move:'away'}),beat('stand',600)]}
});
export const sceneNames=Object.freeze(Object.keys(scenes));

// One clock advances beats. Pauses retain progress; cancellation invalidates pending asset loads.
export class SceneClock {
 constructor(){this.name=null;this.index=-1;this.deadline=0;this.pausedAt=null;this.version=0;this.completed=0;this.current=null}
 start(name,now){if(!scenes[name])return false;this.cancel();this.name=name;this.index=-1;this.deadline=now;return true}
 cancel(){this.version++;this.name=null;this.index=-1;this.current=null;this.pausedAt=null}
 pause(now){if(this.name&&this.pausedAt===null)this.pausedAt=now}
 resume(now){if(this.pausedAt!==null){this.deadline+=Math.max(0,now-this.pausedAt);this.pausedAt=null}}
 step(now){if(!this.name||this.pausedAt!==null||now<this.deadline)return null;const steps=scenes[this.name].steps;
  if(++this.index>=steps.length){const name=this.name;this.cancel();this.completed++;return {done:name}}
  this.current=steps[this.index];this.deadline=now+this.current.ms;return {...this.current,scene:this.name,index:this.index,version:this.version};
 }
 snapshot(){return {name:this.name,index:this.index,deadline:this.deadline,paused:this.pausedAt!==null,completed:this.completed}}
}
