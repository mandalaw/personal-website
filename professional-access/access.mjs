import {theme} from '/hiring/ui.mjs';
import {ACCOUNT_ORIGIN, accountLink, safeContext} from '/account-ui/context.mjs';
import {privatePlatform} from './platform-config.mjs';
theme();

const controls = document.getElementById('private-access');
const signin = document.getElementById('resume-signin');
const download = document.getElementById('resume-download');
const invitation = document.getElementById('resume-invitation');
const guest = document.getElementById('resume-guest');
const ready = document.getElementById('resume-ready');
const enabled = privatePlatform.enabled === true && privatePlatform.origin === ACCOUNT_ORIGIN;

if (controls && signin && download && invitation && guest && ready) {
  controls.hidden = !enabled;
  const updateLinks = () => {
    const context = safeContext(location.pathname + location.hash);
    signin.href = accountLink('/sign-in/', context);
    invitation.href = accountLink('/access/', context);
  };
  updateLinks();
  new MutationObserver(updateLinks).observe(document.documentElement, {attributes:true, attributeFilter:['data-theme']});
  addEventListener('hashchange', updateLinks);

  // Mirror the existing header's validated résumé capability, never infer permission from a name or role.
  // The protected endpoint remains the authorization boundary, including expiry and revocation.
  document.addEventListener('dev-account-state', event => {
    const headerDownload = document.querySelector('.account-cluster .account-resume');
    const available = enabled && event.detail?.authenticated === true && headerDownload?.hidden === false;
    signin.hidden = available;
    guest.hidden = available;
    download.hidden = !available;
    ready.hidden = !available;
  });
  document.dispatchEvent(new Event('dev-account-state-request'));
}
