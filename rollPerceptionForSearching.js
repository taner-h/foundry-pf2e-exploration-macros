if (!game.user.isGM) {
  return ui.notifications.info("This is a GM only macro");
}

const exceptions = ["vehicle", "loot", "hazard", "party"];

let content = `<strong>Search - Perception </strong>
		<table>
		<tr>
			<th style="text-align:left">Name</th>
			<th style="text-align:center">Roll + Mod</th>
			<th style="text-align:center">Total</th>
		</tr>`;

for (const t of canvas.tokens.placeables) {
  if (!exceptions.includes(t.actor.type) && t.actor.hasPlayerOwner) {
    const currentActivityIds = t.actor.system.exploration;
    const activities = t.actor.items.filter((item) =>
      item.system?.traits?.value?.includes("exploration")
    );
    let isSearching = false;
    let currenctActivity;

    currentActivityIds?.forEach((activityId) => {
      currenctActivity = activities.find(
        (activity) => activity.id === activityId
      );
      if (currenctActivity?.name === "Search") {
        isSearching = true;
      }
    });

    if (!isSearching) continue;

    const { result, total } = await new Roll(
      `1d20 + ${t.actor.perception.mod}`
    ).evaluate();

    content += `
			<tr>
			<th >${t.actor.name}</th>
			<td style="text-align:center">${result}</td>
			<th style="text-align:center">${total}</th>
			</tr>`;
  }
}
content += `</table>`;

await ChatMessage.create({
  content,
  type: CONST.CHAT_MESSAGE_TYPES.WHISPER,
  whisper: [game.userId],
});
