/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard,
   HomeV1, HomeV2, HomeV3, ProfileV1, ProfileV2, ProfileV3 */

const W = 430;
const H_HOME    = 1280;
const H_PROFILE = 820;

const App = () => (
  <DesignCanvas>
    <DCSection
      id="home"
      title="מסך הבית — Home"
      subtitle="Three redesigns of the home screen — copy and functionality preserved verbatim. Same design tokens, three different ways of arranging hero / stats / amber callout / routes."
    >
      <DCArtboard id="home-v1" label="V1 · Quiet Index — stats as a ledger, amber ribbon promoted"
        width={W} height={H_HOME}>
        <HomeV1 />
      </DCArtboard>
      <DCArtboard id="home-v2" label="V2 · Masthead — typographic hero, amber alongside CTA, routes lead"
        width={W} height={H_HOME}>
        <HomeV2 />
      </DCArtboard>
      <DCArtboard id="home-v3" label="V3 · Progress-first — single composite card stitches stats + parts + amber"
        width={W} height={H_HOME}>
        <HomeV3 />
      </DCArtboard>
    </DCSection>

    <DCSection
      id="profile"
      title="פרופיל — /more"
      subtitle="Three redesigns of the profile screen — copy and functionality preserved. Identity is foregrounded, destructive reset is visually distinct from logout, and the single-row אודות section folds into a footer note."
    >
      <DCArtboard id="profile-v1" label="V1 · Identity hero — monogram portrait, amber reset"
        width={W} height={H_PROFILE}>
        <ProfileV1 />
      </DCArtboard>
      <DCArtboard id="profile-v2" label="V2 · Name plate — book-cover identity card"
        width={W} height={H_PROFILE}>
        <ProfileV2 />
      </DCArtboard>
      <DCArtboard id="profile-v3" label="V3 · Reading layout — page-like label/value pairs"
        width={W} height={H_PROFILE}>
        <ProfileV3 />
      </DCArtboard>
    </DCSection>
  </DesignCanvas>
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
