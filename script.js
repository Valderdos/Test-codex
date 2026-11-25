const sectionLinks = document.querySelectorAll('nav a');

function markCurrentSection() {
  for (const link of sectionLinks) {
    if (link.hash === location.hash) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}

window.addEventListener('hashchange', markCurrentSection);
markCurrentSection();

const gauge = document.querySelector('.instrument');
const gaugeSvg = gauge.querySelector('svg');
const dial = gauge.querySelector('.dial-control');
const needlePosition = gauge.querySelector('.needle-position');
const center = { x: 250, y: 248 };
const minimumAngle = -216;
const maximumAngle = 36;
const initialAngle = -137;
let gaugeValue = 31;
let dragPointer = null;

function setGaugeValue(value) {
  gaugeValue = Math.min(100, Math.max(0, Math.round(value)));
  const angle = minimumAngle + (maximumAngle - minimumAngle) * gaugeValue / 100;
  const heat = gaugeValue < 40 ? 'Слабый нагрев' : gaugeValue < 70 ? 'Средний нагрев' : 'Сильный нагрев';

  gauge.classList.add('is-adjusted');
  needlePosition.setAttribute('transform', 'rotate(' + (angle - initialAngle) + ' ' + center.x + ' ' + center.y + ')');
  gauge.setAttribute('aria-valuenow', gaugeValue);
  gauge.setAttribute('aria-valuetext', heat + ', ' + gaugeValue + '% шкалы');
}

function moveNeedle(event) {
  const point = new DOMPoint(event.clientX, event.clientY)
    .matrixTransform(gaugeSvg.getScreenCTM().inverse());
  const x = point.x - center.x;
  const y = point.y - center.y;
  if (Math.hypot(x, y) < 12) return;

  let angle = Math.atan2(y, x) * 180 / Math.PI;
  // Use the nearer end of the scale when the pointer goes below the dial.
  if (angle > 90) angle -= 360;
  setGaugeValue((angle - minimumAngle) * 100 / (maximumAngle - minimumAngle));
}

dial.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || dragPointer !== null) return;
  dragPointer = event.pointerId;
  dial.setPointerCapture(dragPointer);
  gauge.focus({ preventScroll: true });
  moveNeedle(event);
});

dial.addEventListener('pointermove', (event) => {
  if (event.pointerId === dragPointer) moveNeedle(event);
});

dial.addEventListener('lostpointercapture', () => {
  dragPointer = null;
});

gauge.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowLeft':
    case 'ArrowDown':
      setGaugeValue(gaugeValue - 5);
      break;
    case 'ArrowRight':
    case 'ArrowUp':
      setGaugeValue(gaugeValue + 5);
      break;
    case 'Home':
      setGaugeValue(0);
      break;
    case 'End':
      setGaugeValue(100);
      break;
    default:
      return;
  }
  event.preventDefault();
});
