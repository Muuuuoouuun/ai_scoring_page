# V5 browser observations, 2026-09-12

Source beeb02a1e58ecdab6864d5206885b4d14d2d7ba7; deployment succeeded2026-09-12T08:17:24Z, envrevision2, existing owner-private Site.

- Local CUA UI: home shows upcoming Paris/London official events and real existing published story (local test), not made-up counts.
- Local subscription create(name V5 청구 연결 검증), monthly30000KRW nextSep15. Actual charge29000KRW onSep12 explicitly linkedSep15. Resultactual29000+remaining60000=forecast89000; rowvariance−1000. DatefilterOct1–31 returns onlyOct15 expected30000, noactual. UI FormData preservesdates.
- Local CUA mobile requested390x844; observedactualdocumentwidth395. Document/scrollwidthboth395; reportcontainers359/359. Screenshotshowsreadabledateinputs and stackedcostcards; noframeworkoverlay.
- Local notification: selectChatGPT/save→alertgenerated→관심없음→settingssave→alertstillhidden. Settingsrestoretopic/save→ChatGPTnoticevisibleagain. Restored original emptyinterests afterward.
- Local Savings: monthly20000 annual200000,12months,overlap30000 transition40000 confirmedrefund10000 ceiling250000 -> monthly240000,switched260000,monthlybetter20000,conservativeupfront270000,andannualceilingfailure. Verified renderedtexts.
- Local createdpaymentandsubscriptionremovedbyUIafterverification. Existingunrelatedlocalrecordsuntouched. Production temporary records were subsequently created, verified, and removed as described below.
- Production /sources: newCopilotcontent+logo success17:17:46/47KST; Midjourneycontent successsamebatch; OpenAIsource403shownasfailurewhilepreviouscuratedinformationretained.
- Production /news?tab=feed: Copilot-specific10items and Midjourney15itemsrenderwithlastsuccessSep12. Sep11 Add VS Code Agents to Copilot usage metrics appearsfirst; currentfeedpath end-to-endobserved.
- Production sourcepageordinaryDOMevalreturnedemptyimg/articles becausecontextnotinnerapp; AXsnapshotshowedall20altlabels. Do NOT countasall20decodedimageverification. Performance/viewportevalofproductionwrapperisnotappmeasurement.

- Production V5 subscription3000KRW / nextSep15 + actualcharge3000Sep12 linkedSep15: fullreload preservesactual3000+remaining6000=forecast9000. RowSep15confirmed, nextOct15/Nov15expected. Deletecharge thencontract byUI ->subscriptionnone/paymentsnone. StableSiteviewreturnedtohome.
