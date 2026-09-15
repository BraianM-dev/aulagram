/** v8.6 · Snapshot local-first.
 * Reúne en una sola lectura todo lo necesario para navegar por las vistas comunes.
 * No incluye bytes de imágenes: sólo asset keys. El navegador mantiene este snapshot
 * y sincroniza en segundo plano, evitando una ejecución de Apps Script por pestaña.
 */
function getClientSnapshot(gateToken, sessionToken) {
  requireGate_(gateToken);
  const viewer = sessionAlias_(sessionToken || '');
  const me = getMyState(gateToken, sessionToken || '');
  const home = getHome(gateToken, sessionToken || '');
  const profiles = getProfiles(gateToken, sessionToken || '', '');
  const profileViews = {};
  profiles.forEach(function(p){
    try { profileViews[p.alias] = getProfile(p.alias, gateToken, sessionToken || ''); }
    catch (e) {}
  });
  const activity = me.logged ? getActivity(gateToken, sessionToken) : [];
  const conversations = me.logged ? getConversations(gateToken, sessionToken) : [];
  const threads = {};
  let target = '';

  if (me.logged) {
    const rawProfiles = jsonRead_('profiles', {});
    const allMessages = jsonRead_('messages', []);
    const grouped = {};
    allMessages.forEach(function(m){
      if (m.from !== viewer && m.to !== viewer) return;
      const other = m.from === viewer ? m.to : m.from;
      if (!grouped[other]) grouped[other] = [];
      grouped[other].push(safeJsonClone_(m));
    });
    Object.keys(rawProfiles).forEach(function(alias){
      if (alias === viewer) return;
      const rp = rawProfiles[alias];
      threads[alias] = {
        me: viewer,
        other: publicProfile_(rp, viewer),
        messages: (grouped[alias] || []).slice(-AG.MESSAGE_LIMIT)
      };
    });
    target = conversations.length ? conversations[0].alias : AG.GENERAL_BOT;
  }

  return {
    ok: true,
    version: AG.VERSION,
    generatedAt: Date.now(),
    bootstrap: {
      ok:true,
      version:AG.VERSION,
      className:AG.CLASS_NAME,
      settings:home.settings,
      me:me.logged ? me.profile : null,
      admin:false,
      profileCount:profiles.length,
      botAliases:profiles.filter(function(p){return p.role==='bot'||p.role==='official';}).map(function(p){return p.alias;})
    },
    me: me,
    homeView: {me:me, data:home},
    profiles: profiles,
    profileViews: profileViews,
    activityView: {me:me, activity:activity},
    messagesView: {
      me:me,
      conversations:conversations,
      profiles:profiles,
      target:target,
      conversation:target && threads[target] ? threads[target] : null
    },
    threads: threads
  };
}
