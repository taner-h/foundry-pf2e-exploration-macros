const getActor = () => {
  return canvas.tokens.controlled.length
    ? canvas.tokens.controlled.map((token) => token.actor)[0]
    : game.user.character;
};
const actor = getActor();
if (!actor) {
  return ui.notifications.warn("No character selected!");
}

const party = Array.from(actor.parties)[0];

const explorationActivities = actor.items.filter((item) =>
  item.system?.traits?.value?.includes("exploration")
);

if (explorationActivities.length === 0) {
  return ui.notifications.warn(
    "No exploration activity found on the selected token's sheet."
  );
}

const activities = explorationActivities.map((activity) => ({
  name: activity.name,
  id: activity._id,
  callback: () => activateExplorationActivity(activity._id),
}));

const currentActivityIds = actor.system.exploration;

async function activateExplorationActivity(id) {
  actor.system.exploration = [id];
  await party.sheet.render();
}

async function buttonDialog(data) {
  return await new Promise(async (resolve) => {
    let buttons = {},
      dialog;

    data.buttons.forEach(([name, id, callback]) => {
      let label;
      if (currentActivityIds.includes(id)) {
        label = `<div style='font-weight: 700'>${name}</div>`;
      } else {
        label = `${name}`;
      }
      buttons[name] = {
        label: label,
        callback,
      };
    });

    dialog = new Dialog(
      {
        title: data.title,
        buttons,
        close: () => resolve(true),
      },
      {
        width: 240,
        height: 34 * activities.length + 16 + 30,
      }
    );

    await dialog._render(true);
    dialog.element.find(".dialog-buttons").css({ "flex-direction": "column" });
  });
}

let data = {
  buttons: activities.map((activity) => [
    activity.name,
    activity.id,
    activity.callback,
  ]),
  title: `Exploration Activities`,
};

await buttonDialog(data);
