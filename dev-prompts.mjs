// Authored public hints. Chips open guide topics; nothing navigates without a click.
const p=(text,topic='help',chips=[])=>({text,topic,chips});
export const prompts=Object.freeze({
 ENTRY:[p('Hello.'),p('Psst.'),p('Poke around.'),p('Need a hint?'),p('Pick a door.','help',[['Work','best','work'],['Play','break','board']]),p('Maps or code?','help',[['Maps','gis','map'],['Code','build','terminal']]),p('Want a secret?','secrets',[['Show me','secrets','archive'],['Not yet','dismiss','close']]),p('Want the technical stuff?','build',[['Interfaces','frontend','web'],['Behind them','backend','terminal']]),p('That button works.','worlds'),p('Project or side quest?','help',[['Project','best','work'],['Side quest','break','board']]),p('Curious?','secrets')],
 WORKBENCH:[p('Want the technical stuff?','build',[['Code','build','terminal'],['Data','data','data']]),p('Try a piece.','build'),p('Follow the connection.','integrations'),p('Maps hide here too.','gis'),p('A little debugging break.','testing'),p('What are you building?','build',[['Interface','frontend','web'],['Integration','integrations','plug']])],
 PORTFOLIO:[p('Open the details.','projects'),p('There’s a story inside.','projects'),p('Work or a detour?','help',[['Work','projects','work'],['Detour','secrets','archive']]),p('Pick a project.','best'),p('The small print helps.','contributions')],
 TRUSTAI:[p('That one’s live.','trustai'),p('Want to see it live?','trustai',[['Tell me more','trustai','model'],['How it checks','llmchecks','test']]),p('Check the answer.','llmchecks'),p('Confident isn’t enough.','ai'),p('Peek under the hood?','trustai',[['Models','llmchecks','model'],['App','truststack','web']])],
 GIS:[p('Maps? Of course.','gis'),p('Location changes the answer.','garden'),p('Follow the map.','gis'),p('How were sites compared?','garden',[['The analysis','garden','map'],['The data','data','data']])],
 ABOUT:[p('That’s the actual human.','study'),p('The longer version?','experience'),p('Code, maps, other things.','build'),p('Not all résumé material.','photo')],
 RESUME:[p('Need the PDF?','resume'),p('Email is easiest.','contact')],
 CONTACT:[p('Say hi.','contact'),p('Email is easiest.','contact'),p('Over to Ahmed.','contact'),p('A project or a role?','available',[['Work together','available','work'],['Contact','contact','mail']])],
 SIDE_QUESTS:[p('One game?','reversi',[['The board','reversi','board'],['Another door','secrets','archive']]),p('Yes, there’s a game.','reversi'),p('Want a secret?','secrets'),p('The old site survived.','old'),p('A short detour.','fun'),p('No high score to chase.','reversi')],
 VISUALS:[p('Still choosing the frames.','visuals'),p('Through the lens.','photo'),p('This room’s taking shape.','visuals')],
 FOOTER:[p('Still here?','secrets'),p('One more door?','secrets',[['Old site','old','archive'],['One game','reversi','board']]),p('Poke around. I’ll wait.','help'),p('See you around.','contact')],
 LOST:[p('Home’s over there.','lost'),p('A scenic detour.','lost'),p('Want a way back?','lost',[['Work','best','work'],['Home','worlds','layers']])]
});
export function bank(context){return prompts[context]||prompts.ENTRY}
