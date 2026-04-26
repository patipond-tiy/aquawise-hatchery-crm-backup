/* global React, ReactDOM, IOSDevice */
const { useState, useEffect } = React;

// Tweaks state
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

  // Apply accent override
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

  return (
    <>
      <DC.DesignCanvas title="AquaWise Hatchery — Phase H1" subtitle="Functional design package · Apr 2026">
        <DC.DCSection id="webapp" title="Hatchery Webapp" subtitle="H2 Dashboard · H3 Customer List — fully clickable">
          <DC.DCArtboard id="hatchery-app" label="Hatchery webapp (clickable)" width={1280} height={820}>
            <window.HatcheryApp lang={lang} setLang={(l) => { setLang(l); setTweak('lang', l); }}/>
          </DC.DCArtboard>
        </DC.DCSection>

        <DC.DCSection id="line" title="LINE OA — Farmer surfaces" subtitle="F2 Welcome · F3 Daily price · F6 Day-30 · F7 Day-60">
          <DC.DCArtboard id="f2" label="F2 · Welcome conversation" width={390} height={760}>
            <ArtboardPhone title="AquaWise"><window.FlexF2_Welcome/></ArtboardPhone>
          </DC.DCArtboard>
          <DC.DCArtboard id="f3" label="F3 · Daily price card (Variant A — calm)" width={390} height={760}>
            <ArtboardPhone title="AquaWise"><window.FlexF3_Price variant="a"/></ArtboardPhone>
          </DC.DCArtboard>
          <DC.DCArtboard id="f3b" label="F3 · Daily price card (Variant B — bold header)" width={390} height={760}>
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

        <DC.DCSection id="liff" title="LINE LIFF — Hatchery counter" subtitle="H1 Single-screen batch entry · 15-second test">
          <DC.DCArtboard id="h1" label="H1 · Counter batch entry (LIFF)" width={390} height={760}>
            <ArtboardPhone><window.LIFFH1_BatchEntry/></ArtboardPhone>
          </DC.DCArtboard>
        </DC.DCSection>

        <DC.DCSection id="poster" title="QR Poster" subtitle="F1 · A4 print, single page, hatchery counter">
          <DC.DCArtboard id="f1" label="F1 · QR poster (A4)" width={595} height={842}>
            <window.PosterF1/>
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
