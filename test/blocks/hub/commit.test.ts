import { describe, expect, it } from 'vitest';
import { el, setupDom } from '../../utils/test-utils';
import { extractBlocks } from '../../../src/utils/extract';
import { toMd } from '../../../src/sites/hub/convert';
import { type XletContexts } from '../../../src/settings';
import { mainBlocks } from '../../../src/sites/hub/pages/commit';

setupDom();

describe('github commit page blocks', () => {
  describe('attribution', () => {
    it('should have proper spacing around the author names', () => {
      const html = `<div class="color-fg-muted CommitAttribution-module__CommitAttributionContainer__I_rfs"><span data-variant="cascade" data-shape="circle" data-avatar-count="3" data-responsive="" class="pc-AvatarStack--variant pc-AvatarStack--shape pc-AvatarStack--three prc-AvatarStack-AvatarStack-vkIK2" style="--stackSize-narrow:20px;--stackSize-regular:20px;--stackSize-wide:20px"><div class="pc-AvatarStackBody prc-AvatarStack-AvatarStackBody-JFK4u" tabindex="0"> <img data-component="Avatar" class="pc-AvatarItem prc-AvatarStack-AvatarItem-70eW3 prc-Avatar-Avatar-0xaUi" alt="zanieb" width="20" height="20" style="--avatarSize-regular:20px" src="https://avatars.githubusercontent.com/u/2586601?v=4&amp;size=40" data-testid="commit-stack-avatar" data-hovercard-url="/users/zanieb/hovercard" data-hovercard-type="user" octo-click="hovercard-link-click" octo-dimensions="link_type:self" aria-keyshortcuts="Alt+ArrowUp"><img data-component="Avatar" class="pc-AvatarItem prc-AvatarStack-AvatarItem-70eW3 prc-Avatar-Avatar-0xaUi" alt="claude" width="20" height="20" style="--avatarSize-regular:20px" src="https://avatars.githubusercontent.com/u/81847?v=4&amp;size=40" data-testid="commit-stack-avatar" data-hovercard-url="/users/claude/hovercard" data-hovercard-type="user" octo-click="hovercard-link-click" octo-dimensions="link_type:self" aria-keyshortcuts="Alt+ArrowUp"></div></span><div data-testid="author-link" class="AuthorLink-module__authorLinkContainer__RsptC CommitAttribution-module__AuthorLink__DV7CP"><a class="Link__StyledLink-sc-1syctfj-0 dtKDuy AuthorLink-module__authorNameLink__ClG6W prc-Link-Link-9ZwDx" data-muted="true" muted="" href="/astral-sh/uv/commits?author=zanieb" aria-label="commits by zanieb" data-hovercard-url="/users/zanieb/hovercard" data-hovercard-type="user" octo-click="hovercard-link-click" octo-dimensions="link_type:self" aria-keyshortcuts="Alt+ArrowUp">zanieb</a></div><span class="pl-1">and</span><div data-testid="author-link" class="AuthorLink-module__authorLinkContainer__RsptC CommitAttribution-module__AuthorLink__DV7CP"><a class="Link__StyledLink-sc-1syctfj-0 dtKDuy AuthorLink-module__authorNameLink__ClG6W prc-Link-Link-9ZwDx" data-muted="true" muted="" href="/astral-sh/uv/commits?author=claude" aria-label="commits by claude" data-hovercard-url="/users/claude/hovercard" data-hovercard-type="user" octo-click="hovercard-link-click" octo-dimensions="link_type:self" aria-keyshortcuts="Alt+ArrowUp">claude</a></div><span class="pl-1">authored</span><relative-time class="pl-1" datetime="2026-03-19T13:23:46.000Z" title="Mar 19, 2026, 6:23 AM PDT">Mar 19, 2026</relative-time><span class="d-flex ml-2 mr-1">·</span><button type="button" data-testid="checks-status-badge-button" aria-label="Status checks: failure" class="prc-Button-ButtonBase-9n-Xk Button__StyledButtonComponent-sc-vqy3e4-0 bqvXvo ChecksStatusBadge-module__ChecksStatusBadgeButton__vTwYt AsyncChecksStatusBadge-module__ChecksStatusBadge__wbwBt" data-loading="false" data-size="small" data-variant="invisible"><span data-component="buttonContent" data-align="center" class="prc-Button-ButtonContent-Iohp5"><span data-component="leadingVisual" class="prc-Button-Visual-YNt2F prc-Button-VisualWrap-E4cnq"><svg aria-hidden="true" focusable="false" class="octicon octicon-x" viewBox="0 0 16 16" width="16" height="16" fill="currentColor" display="inline-block" overflow="visible" style="vertical-align: text-bottom;"><path d=""></path></svg></span><span data-component="text" class="prc-Button-Label-FWkx3">111 / 114</span></span></button><span class="d-flex ml-2">·</span><div class="ml-2"><button class="SignedCommitBadge-module__clickableLabel__seodh prc-Label-Label-qG-Zu" data-size="small" data-variant="success">Verified</button></div></div>`;

      const ctxs: XletContexts = { md: { now: new Date('2026-03-22T00:00:00.000Z') } };

      const block = mainBlocks.find((b) => b.name === 'attribution');
      expect(block).toBeDefined();
      if (!block) return;

      const [attribution] = extractBlocks(el(`<div>${html}</div>`), [block], ctxs);
      expect(attribution).toBeDefined();
      if (!attribution) return;

      const md = toMd(attribution, ctxs.md);
      expect(md).toBe('zanieb and claude authored on 2026-03-19 (2 days ago)');
    });

    it('should include the author name', () => {
      const html = `<div class="color-fg-muted CommitAttribution-module__CommitAttributionContainer__I_rfs"><div data-testid="author-avatar" class="Box-sc-62in7e-0 AuthorAvatar-module__AuthorAvatarContainer__n0MVc"><a class="Link__StyledLink-sc-1syctfj-0 prc-Link-Link-9ZwDx" href="/fregante" data-testid="avatar-icon-link" data-hovercard-url="/users/fregante/hovercard" data-hovercard-type="user" octo-click="hovercard-link-click" octo-dimensions="link_type:self" aria-keyshortcuts="Alt+ArrowUp"><img data-component="Avatar" class="AuthorAvatar-module__authorAvatarImage__a3R8x prc-Avatar-Avatar-0xaUi" alt="fregante" width="20" height="20" style="--avatarSize-regular:20px" src="https://avatars.githubusercontent.com/u/1402241?v=4&amp;size=40" data-testid="github-avatar" aria-label="fregante"></a><a class="Link__StyledLink-sc-1syctfj-0 dtKDuy AuthorAvatar-module__authorHoverableLink__MHTT8 prc-Link-Link-9ZwDx" data-muted="true" muted="" href="/refined-github/refined-github/commits?author=fregante" aria-label="commits by fregante" data-hovercard-url="/users/fregante/hovercard" data-hovercard-type="user" octo-click="hovercard-link-click" octo-dimensions="link_type:self" aria-keyshortcuts="Alt+ArrowUp">fregante</a></div><span class="pl-1">authored</span><relative-time class="pl-1" datetime="2022-03-17T05:11:03.000Z" title="Mar 16, 2022, 10:11 PM PDT">Mar 16, 2022</relative-time><div class="ml-2"><button class="SignedCommitBadge-module__clickableLabel__seodh prc-Label-Label-qG-Zu" data-size="small" data-variant="success">Verified</button></div></div>`;

      const ctxs: XletContexts = { md: { now: new Date('2026-03-22T00:00:00.000Z') } };

      const block = mainBlocks.find((b) => b.name === 'attribution');
      expect(block).toBeDefined();
      if (!block) return;

      const [attribution] = extractBlocks(el(`<div>${html}</div>`), [block], ctxs);
      expect(attribution).toBeDefined();
      if (!attribution) return;

      const md = toMd(attribution, ctxs.md);
      expect(md).toBe('fregante authored on 2022-03-16 (4 years ago)');
    });

  });
});
