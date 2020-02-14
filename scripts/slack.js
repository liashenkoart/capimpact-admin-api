const SlackWebhook = require('slack-webhook');

const slack = new SlackWebhook(
  'https://hooks.slack.com/services/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',
  {
    defaults: {
      username: 'Deploy Man',
      channel: '#capadmin',
      icon_emoji: ':robot_face:',
    },
  },
);

slack
  .send({
    text: `:rocket: :rocket: :rocket: CapAdmin API deploy done!`,
  })
  .then(() => process.exit(0));
