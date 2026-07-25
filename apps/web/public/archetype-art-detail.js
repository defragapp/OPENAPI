const archetypeDetailLayers = {
  three_of_cups: `
    <g class="visual-detail detail-three-cups" fill="none" stroke="#3d2a22" stroke-linecap="round" stroke-linejoin="round">
      <g class="detail-faces" stroke-width="1.7">
        <path d="M76 149l5-2 5 2m-7 5 4 1 4-1M143 134l5-2 5 2m-7 5 4 1 4-1M213 149l5-2 5 2m-7 5 4 1 4-1"/>
      </g>
      <g class="detail-folds" stroke-width="1.55" opacity=".82">
        <path d="M68 191c9 18 12 57 10 105M86 188c-3 34 2 72 11 111M139 178c-5 35-4 82 3 126M161 178c7 41 10 81 8 126M207 191c-4 36 0 74 11 107M228 190c8 30 10 66 8 105"/>
        <path d="M58 233c22 8 43 9 64 2M113 220c27 12 54 12 81 0M184 236c22 8 43 8 64 0"/>
      </g>
      <g class="detail-cup-lines" stroke="#8e602e" stroke-width="1.6">
        <path d="M72 116c4 5 16 5 21 0M139 91c5 5 17 5 23 0M209 116c4 5 16 5 21 0"/>
      </g>
    </g>
    <g class="visual-detail detail-garden" opacity=".9">
      <circle cx="48" cy="347" r="4" fill="#c95742" stroke="#3d2a22" stroke-width="1.5"/>
      <circle cx="58" cy="354" r="3.5" fill="#d9a844" stroke="#3d2a22" stroke-width="1.4"/>
      <circle cx="246" cy="348" r="4" fill="#c95742" stroke="#3d2a22" stroke-width="1.5"/>
      <circle cx="257" cy="354" r="3.5" fill="#d9a844" stroke="#3d2a22" stroke-width="1.4"/>
      <path d="M45 365c-2-8 2-14 9-17m198 17c2-8-2-14-9-17" fill="none" stroke="#60724f" stroke-width="2"/>
    </g>`,
  fool: `
    <g class="visual-detail detail-fool" fill="none" stroke="#3d2a22" stroke-linecap="round" stroke-linejoin="round">
      <g class="detail-face" stroke-width="1.6"><path d="M132 110l5-2 5 2m-6 6 4 1 4-1"/></g>
      <g class="detail-garment" stroke-width="1.5" opacity=".88">
        <path d="M124 151l19 15 18-17 18 18M117 185l25 18 24-20 25 17M115 221l27-18 27 19 20-17"/>
        <path d="M128 139l-7 98M150 141l2 101M174 145l10 91"/>
      </g>
      <g class="detail-cliff" stroke="#72533e" stroke-width="1.35" opacity=".72">
        <path d="M206 333l16-15m-7 24 21-21m-10 30 25-24m-15 32 27-25"/>
      </g>
    </g>
    <g class="visual-detail detail-sun-rays" stroke="#b78333" stroke-width="1.8" opacity=".8">
      <path d="M238 38v-13m0 98v-13m-36-36h-13m98 0h-13m-61-25-10-10m69 69-10-10m0-49 10-10m-69 69 10-10"/>
    </g>`,
  magician: `
    <g class="visual-detail detail-magician" fill="none" stroke="#3d2a22" stroke-linecap="round" stroke-linejoin="round">
      <g class="detail-face" stroke-width="1.6"><path d="M143 110l5-2 5 2m-6 6 4 1 4-1"/></g>
      <g class="detail-robe" stroke-width="1.45" opacity=".84">
        <path d="M126 151l20 19 20-20M117 180l27 22 32-22M111 216l31-17 38 18"/>
        <path d="M134 143l-9 99M158 143l2 102M179 151l8 91"/>
      </g>
      <g class="detail-tools" stroke-width="1.5">
        <path d="M91 243h24m-12-12v24M143 229l28 14m-28 0 28-14M192 247c6-12 18-12 24 0"/>
      </g>
    </g>
    <g class="visual-detail detail-garden" opacity=".88">
      <path d="M45 356c10-20 19-20 29 0m152 0c10-20 19-20 29 0" fill="none" stroke="#657653" stroke-width="2"/>
      <circle cx="58" cy="349" r="4" fill="#bd4f3c" stroke="#3d2a22" stroke-width="1.4"/>
      <circle cx="242" cy="349" r="4" fill="#e6dfcb" stroke="#3d2a22" stroke-width="1.4"/>
    </g>`,
  hermit: `
    <g class="visual-detail detail-hermit" fill="none" stroke="#3d2a22" stroke-linecap="round" stroke-linejoin="round">
      <g class="detail-face" stroke-width="1.5"><path d="M136 128l5-2 5 2m-5 6c7 1 11 5 14 11"/></g>
      <g class="detail-cloak" stroke-width="1.5" opacity=".84">
        <path d="M112 176c7 35 7 83 1 137M137 172c-4 47-1 95 7 143M165 177c12 41 17 84 16 132"/>
        <path d="M96 218c28 10 57 9 86-2M91 264c35 12 70 10 105-3"/>
      </g>
      <g class="detail-mountain" stroke="#596875" stroke-width="1.2" opacity=".72">
        <path d="M48 352l70-96m-50 111 65-89m37 53 44-54m-21 80 38-47"/>
      </g>
    </g>
    <g class="visual-detail detail-lantern-rays" stroke="#d1a64d" stroke-width="1.6" opacity=".82">
      <path d="M225 205v-18m0 119v-18m-41-41h-18m119 0h-18m-71-29-13-13m84 84-13-13m0-58 13-13m-84 84 13-13"/>
    </g>`,
  strength: `
    <g class="visual-detail detail-strength" fill="none" stroke="#3d2a22" stroke-linecap="round" stroke-linejoin="round">
      <g class="detail-face" stroke-width="1.5"><path d="M121 120l5-2 5 2m-6 6 4 1 4-1"/></g>
      <g class="detail-dress" stroke-width="1.45" opacity=".82">
        <path d="M103 168c7 34 7 73 0 112M128 160c-3 42 1 84 10 120M154 164c10 35 14 73 12 112"/>
        <path d="M91 212c26 10 53 9 80-2M86 252c32 12 64 11 96-1"/>
      </g>
      <g class="detail-mane" stroke="#7d552f" stroke-width="1.8" opacity=".9">
        <path d="M166 236c8-13 18-20 31-22m-27 31c11-13 24-20 39-20m-35 31c14-12 29-17 46-15m-42 27c16-9 32-11 49-6m-46 20c17-6 33-5 48 3"/>
      </g>
    </g>
    <g class="visual-detail detail-garden" opacity=".86">
      <circle cx="57" cy="348" r="4" fill="#c85742" stroke="#3d2a22" stroke-width="1.4"/>
      <circle cx="244" cy="348" r="4" fill="#e6ddc7" stroke="#3d2a22" stroke-width="1.4"/>
    </g>`,
  tower: `
    <g class="visual-detail detail-tower" fill="none" stroke="#3d2a22" stroke-linecap="round" stroke-linejoin="round">
      <g class="detail-bricks" stroke-width="1.25" opacity=".78">
        <path d="M103 166h94M101 192h96M100 218h97M99 244h99M98 270h100M97 296h101M96 322h102"/>
        <path d="M124 145v21m47-21v21m-58 26v26m48-26v26m-37 26v26m47-26v26m-58 26v26m48-26v26"/>
      </g>
      <g class="detail-clouds" stroke="#6a5c55" stroke-width="2" opacity=".78">
        <path d="M35 83c12-15 31-15 43 0 12-11 29-7 34 7M195 112c12-16 31-16 43 0 11-10 27-7 32 7"/>
      </g>
      <g class="detail-crown" stroke-width="2"><path d="M176 88l17-20 13 17 18-17 11 22-21 11Z" fill="#d3a342"/></g>
    </g>
    <g class="visual-detail detail-flame" fill="#bd513a" stroke="#3d2a22" stroke-width="1.6" opacity=".88">
      <path d="M125 150c-8-17 3-27 9-39 9 15 12 26 2 39Zm42 0c-8-16 3-26 9-38 8 14 12 25 2 38Z"/>
    </g>`
};

let detailFrame = 0;
const detailObserver = new MutationObserver(scheduleArchetypeDetails);
detailObserver.observe(document.documentElement, { childList: true, subtree: true });
scheduleArchetypeDetails();

function scheduleArchetypeDetails() {
  cancelAnimationFrame(detailFrame);
  detailFrame = requestAnimationFrame(applyArchetypeDetails);
}

function applyArchetypeDetails() {
  document.querySelectorAll('.thread-visual-card[data-archetype]').forEach((card) => {
    const archetype = card.dataset.archetype;
    const svg = card.querySelector('.thread-card-art svg');
    const detail = archetypeDetailLayers[archetype];
    if (!svg || !detail || svg.dataset.houseDetail === 'v1') return;
    svg.dataset.houseDetail = 'v1';
    svg.insertAdjacentHTML('beforeend', detail);
  });
}
