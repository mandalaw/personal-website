// New implementation for this website. No code from the 2022 coursework is reused.
export const SIZE=8;
const DIRECTIONS=[[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];
export function initial(){const board=Array(64).fill(0);board[27]=board[36]=2;board[28]=board[35]=1;return {board,turn:1,over:false,passed:null,last:null}}
export function captures(board,index,player){if(!Number.isInteger(index)||index<0||index>=64||board[index]!==0||![1,2].includes(player))return [];const row=Math.floor(index/8),col=index%8,result=[];for(const [dr,dc]of DIRECTIONS){let r=row+dr,c=col+dc,line=[];while(r>=0&&r<8&&c>=0&&c<8&&board[r*8+c]===3-player){line.push(r*8+c);r+=dr;c+=dc}if(line.length&&r>=0&&r<8&&c>=0&&c<8&&board[r*8+c]===player)result.push(...line)}return result}
export function legal(board,player){return board.flatMap((_,index)=>captures(board,index,player).length?[index]:[])}
export function score(board){return {dark:board.filter(x=>x===1).length,light:board.filter(x=>x===2).length}}
export function move(state,index){if(state.over)return null;const flipped=captures(state.board,index,state.turn);if(!flipped.length)return null;const board=state.board.slice();board[index]=state.turn;flipped.forEach(i=>board[i]=state.turn);const other=3-state.turn,otherMoves=legal(board,other),ownMoves=legal(board,state.turn);return {board,turn:otherMoves.length?other:state.turn,over:!otherMoves.length&&!ownMoves.length,passed:!otherMoves.length&&ownMoves.length?other:null,last:index,flipped}}
