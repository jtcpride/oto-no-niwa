window.otoPatchFailV0116=function(html){
// v0.11.6 — make failed returns visibly read as a human stagger while keeping full pose restoration.
// Built on v0.11.5: no kick on failure, no head spinning, no cumulative transform drift.
html=html.replace("version:'0.11.5-human-body-hit-reaction'","version:'0.11.6-readable-human-stagger'");

// Let the temporary failure pose include both legs so the whole body can absorb the impact,
// while resetFailPoseV0115 still restores every touched node before the next natural pose.
html=html.replace(
 "const FAIL_POSE_NODES_V0115=['body','head','arm','farArm'];",
 "const FAIL_POSE_NODES_V0115=['body','head','arm','farArm','leg','back'];"
);

// Give a normal miss a little more time to show impact -> stagger -> recovery.
html=html.replace("bodyHitV010=.68;","bodyHitV010=.82;");

// Make the three-miss stumble stronger but still human-sized and self-returning.
html=html.replace(
 `  const stumble=Math.sin(t*Math.PI);\n  player.n.pos[2]+=side*.34*stumble;\n  player.body.pos[1]-=.055*stumble;\n  player.body.rot[2]+=side*.16*stumble;\n  player.body.rot[0]-=.07*stumble;\n  player.head.rot[2]+=side*.035*stumble;\n  player.arm.rot[2]+=side*.18*stumble;\n  player.farArm.rot[2]-=side*.14*stumble;`,
 `  const stumble=Math.sin(t*Math.PI);\n  const catchStep=Math.sin(Math.min(1,t/.72)*Math.PI);\n  player.n.pos[0]-=.10*stumble;\n  player.n.pos[2]+=side*.52*stumble;\n  player.body.pos[1]-=.10*stumble;\n  player.body.rot[2]+=side*.26*stumble;\n  player.body.rot[0]-=.13*stumble;\n  player.head.rot[2]+=side*.055*stumble;\n  player.arm.rot[2]+=side*.30*stumble;\n  player.farArm.rot[2]-=side*.24*stumble;\n  player.leg.rot[2]-=side*.12*catchStep;\n  player.back.rot[2]+=side*.18*catchStep;`
);

// Replace the restrained single-miss flinch with a visible but controlled human stumble:
// fast torso impact, one short sideways catch-step, then a complete recovery.
html=html.replace(
 ` // Single miss: torso/shoulder absorbs the ball. Feet stay planted; head follows the torso only slightly.\n const p=Math.max(0,Math.min(1,(.68-bodyHitV010)/.68));\n const impact=Math.sin(p*Math.PI);\n const flinch=Math.sin(Math.min(1,p/.72)*Math.PI);\n player.body.pos[0]-=.065*impact;\n player.body.pos[1]-=.025*impact;\n player.body.rot[2]+=side*.11*impact;\n player.body.rot[0]-=.055*impact;\n player.head.rot[2]+=side*.035*flinch;\n player.arm.rot[2]+=side*.16*impact;\n player.farArm.rot[2]-=side*.13*impact;`,
 ` // Single miss: torso/shoulder takes the ball, the body gives way, then catches balance with one short step.\n const p=Math.max(0,Math.min(1,(.82-bodyHitV010)/.82));\n const impact=Math.sin(Math.min(1,p/.38)*Math.PI);\n const stagger=Math.sin(Math.max(0,Math.min(1,(p-.08)/.78))*Math.PI);\n const catchStep=Math.sin(Math.max(0,Math.min(1,(p-.18)/.62))*Math.PI);\n player.n.pos[0]-=.075*stagger;\n player.n.pos[2]+=side*.28*stagger;\n player.body.pos[0]-=.10*impact;\n player.body.pos[1]-=.075*stagger;\n player.body.rot[2]+=side*(.18*impact+.09*stagger);\n player.body.rot[0]-=.10*impact+.05*stagger;\n player.head.rot[2]+=side*.055*impact;\n player.head.rot[0]-=.035*impact;\n player.arm.rot[2]+=side*.27*impact;\n player.farArm.rot[2]-=side*.22*impact;\n player.leg.rot[2]-=side*.08*catchStep;\n player.back.rot[2]+=side*.12*catchStep;`
);
return html;
};
