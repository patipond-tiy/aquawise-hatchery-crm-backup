/* global React, ReactDOM, IOSDevice */
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "blue",
  "density": "comfortable",
  "radius": 14,
  "priceVariant": "a",
  "lang": "th"
}/*EDITMODE-END*/;

function ArtboardPhone({ children, dark = false, title }) {
  return <IOSDevice width={390} height={760} dark={dark} title={title}>{children}</IOSDevice>;
}

function App() {
  const { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSelect, TweakSlider } = window;
  const [tw, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [lang, setLang] = useState(tw.lang);
  useEffect(() => setLang(tw.lang), [tw.lang]);

  useEffect(() => {
    const root = document.documentElement;
    if (tw.accent === 'cyan') {
      root.style.setProperty('--aw-blue', '#008B8B');
      root.style.setProperty('--aw-blue-700', '#006D6D');
      root.style.setProperty('--aw-blue-50', '#E5F4F4');
    } else {
      root.style.setProperty('--aw-blue', '#004AAD');
      root.style.setProperty('--aw-blue-700', '#003A8A');
      root.style.setProperty('--aw-blue-50', '#EAF1FB');
    }
  }, [tw.accent]);

  const DC = window;
  const setLangBoth = (l) => { setLang(l); setTweak('lang', l); };

  return (
    <>
      <DC.DesignCanvas title="AquaWise Hatchery — Full Design Package"
        subtitle="Phases H1 + H2 + H3 · Apr 2026">

        {/* ─── PHASE H1 ─────────────────────────────── */}
        <DC.DCSection id="h1-webapp" title="H1 · Hatchery Webapp"
          subtitle="Dashboard + Customer list — fully clickable">
          <DC.DCArtboard id="hatchery-app" label="H2/H3 · Hatchery webapp (clickable — try the sidebar)"
            width={1280} height={840}>
            <window.HatcheryApp lang={lang} setLang={setLangBoth}/>
          </DC.DCArtboard>
        </DC.DCSection>

        <DC.DCSection id="h1-line" title="H1 · LINE OA — Farmer surfaces"
          subtitle="F2 Welcome · F3 Daily price · F6/F7 Survival prompts">
          <DC.DCArtboard id="f2" label="F2 · Welcome conversation" width={390} height={760}>
            <ArtboardPhone title="AquaWise"><window.FlexF2_Welcome/></ArtboardPhone>
          </DC.DCArtboard>
          <DC.DCArtboard id="f3a" label="F3 · Daily price (Variant A — calm)" width={390} height={760}>
            <ArtboardPhone title="AquaWise"><window.FlexF3_Price variant="a"/></ArtboardPhone>
          </DC.DCArtboard>
          <DC.DCArtboard id="f3b" label="F3 · Daily price (Variant B — bold)" width={390} height={760}>
            <ArtboardPhone title="AquaWise"><window.FlexF3_Price variant="b"/></ArtboardPhone>
          </DC.DCArtboard>
          <DC.DCArtboard id="f6" label="F6 · Day-30 prompt" width={390} height={760}>
            <ArtboardPhone title="AquaWise"><window.FlexF6_Day30 day={30}/></ArtboardPhone>
          </DC.DCArtboard>
          <DC.DCArtboard id="f6ack" label="F6 · After-response acknowledgment" width={390} height={760}>
            <ArtboardPhone title="AquaWise"><window.FlexF6_Ack/></ArtboardPhone>
          </DC.DCArtboard>
          <DC.DCArtboard id="f7" label="F7 · Day-60 prompt" width={390} height={760}>
            <ArtboardPhone title="AquaWise"><window.FlexF6_Day30 day={60}/></ArtboardPhone>
          </DC.DCArtboard>
        </DC.DCSection>

        <DC.DCSection id="h1-liff" title="H1 · LINE LIFF — Hatchery counter"
          subtitle="Single-screen batch entry · 15-second test">
          <DC.DCArtboard id="h1-liff" label="H1 · Counter batch entry (LIFF)" width={390} height={760}>
            <ArtboardPhone><window.LIFFH1_BatchEntry/></ArtboardPhone>
          </DC.DCArtboard>
        </DC.DCSection>

        <DC.DCSection id="h1-poster" title="H1 · QR Poster"
          subtitle="A4 print · single page · hatchery counter">
          <DC.DCArtboard id="f1" label="F1 · QR poster (A4)" width={595} height={842}>
            <window.PosterF1/>
          </DC.DCArtboard>
        </DC.DCSection>

        {/* ─── PHASE H2 ─────────────────────────────── */}
        <DC.DCSection id="h2-farmer" title="H2 · Farmer surfaces"
          subtitle="F4 Certificate (Flex + PDF) · F5 Cycle update · F8 Harvest reporting">
          <DC.DCArtboard id="f4" label="F4 · Batch certificate (Flex)" width={390} height={760}>
            <ArtboardPhone title="AquaWise"><window.FlexF4_Certificate/></ArtboardPhone>
          </DC.DCArtboard>
          <DC.DCArtboard id="f4-pdf" label="F4 · Batch certificate (PDF, A4)"
            width={595} height={842}>
            <window.CertificatePDF/>
          </DC.DCArtboard>
          <DC.DCArtboard id="f5" label="F5 · Weekly cycle update" width={390} height={760}>
            <ArtboardPhone title="AquaWise"><window.FlexF5_CycleUpdate/></ArtboardPhone>
          </DC.DCArtboard>
          <DC.DCArtboard id="f8" label="F8 · Harvest reporting flow" width={390} height={760}>
            <ArtboardPhone title="AquaWise"><window.FlexF8_Harvest/></ArtboardPhone>
          </DC.DCArtboard>
        </DC.DCSection>

        <DC.DCSection id="h2-webapp" title="H2 · Hatchery webapp pages"
          subtitle="H4 Customer detail · H5 Batch register · H6 Batch detail · H7 Restock predictor"
          collapsed>
          <DC.DCArtboard id="h4" label="H4 · Customer detail" width={1280} height={840}>
            <window.HatcheryApp lang={lang} setLang={setLangBoth} initialPage="customer-detail"/>
          </DC.DCArtboard>
          <DC.DCArtboard id="h5" label="H5 · Batch register entry" width={1280} height={840}>
            <window.HatcheryApp lang={lang} setLang={setLangBoth} initialPage="batch-register"/>
          </DC.DCArtboard>
          <DC.DCArtboard id="h6" label="H6 · Batch detail & certificate" width={1280} height={840}>
            <window.HatcheryApp lang={lang} setLang={setLangBoth} initialPage="batch-detail"/>
          </DC.DCArtboard>
          <DC.DCArtboard id="h7" label="H7 · Restock predictor" width={1280} height={840}>
            <window.HatcheryApp lang={lang} setLang={setLangBoth} initialPage="restock"/>
          </DC.DCArtboard>
        </DC.DCSection>

        <DC.DCSection id="h2-onboard" title="H2 · Hatchery onboarding"
          subtitle="Owner sign-up wizard · ~30 min from agreement to first batch">
          <DC.DCArtboard id="onboard" label="Onboarding wizard" width={1080} height={760}>
            <window.HatcheryApp lang={lang} setLang={setLangBoth} initialPage="onboarding"/>
          </DC.DCArtboard>
        </DC.DCSection>

        <DC.DCSection id="h2-settings" title="H2 · Settings"
          subtitle="H10 · Profile · notifications · public scorecard opt-in · data export">
          <DC.DCArtboard id="h10" label="H10 · Settings & sharing" width={1280} height={840}>
            <window.HatcheryApp lang={lang} setLang={setLangBoth} initialPage="settings"/>
          </DC.DCArtboard>
        </DC.DCSection>

        {/* ─── PHASE H3 ─────────────────────────────── */}
        <DC.DCSection id="h3-farmer" title="H3 · Cross-farm context"
          subtitle="F9 — the hardest design problem in the doc · uncomfortable truth, gracefully">
          <DC.DCArtboard id="f9" label="F9 · Same-batch cross-farm comparison" width={390} height={760}>
            <ArtboardPhone title="AquaWise"><window.FlexF9_CrossFarm/></ArtboardPhone>
          </DC.DCArtboard>
        </DC.DCSection>

        <DC.DCSection id="h3-public" title="H3 · Public scorecard"
          subtitle="H8 · The trust signal — shareable URL, no exact ranks">
          <DC.DCArtboard id="h8" label="H8 · Public scorecard (shareable view)" width={960} height={760}>
            <window.HatcheryApp lang={lang} setLang={setLangBoth} initialPage="scorecard"/>
          </DC.DCArtboard>
        </DC.DCSection>

        <DC.DCSection id="h3-disease" title="H3 · Disease traceback alert"
          subtitle="H9 · Internal alert when an outbreak signal hits a batch threshold">
          <DC.DCArtboard id="h9" label="H9 · Disease traceback alert" width={1280} height={900}>
            <window.HatcheryApp lang={lang} setLang={setLangBoth} initialPage="alerts"/>
          </DC.DCArtboard>
        </DC.DCSection>
      </DC.DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection title="Brand">
          <TweakRadio label="Accent dominance" value={tw.accent}
            onChange={(v) => setTweak('accent', v)}
            options={[{label:'Blue', value:'blue'}, {label:'Cyan', value:'cyan'}]}/>
          <TweakSelect label="Webapp language" value={tw.lang}
            onChange={(v) => setTweak('lang', v)}
            options={[{label:'ไทย (Thai)', value:'th'}, {label:'English', value:'en'}]}/>
        </TweakSection>
        <TweakSection title="LINE Flex">
          <TweakRadio label="Daily price variant" value={tw.priceVariant}
            onChange={(v) => setTweak('priceVariant', v)}
            options={[{label:'A (calm)', value:'a'}, {label:'B (bold)', value:'b'}]}/>
        </TweakSection>
        <TweakSection title="Surface">
          <TweakRadio label="Density" value={tw.density}
            onChange={(v) => setTweak('density', v)}
            options={[{label:'Comfortable', value:'comfortable'}, {label:'Compact', value:'compact'}]}/>
          <TweakSlider label="Card radius" min={6} max={24} step={2} value={tw.radius}
            onChange={(v) => setTweak('radius', v)}/>
        </TweakSection>
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
