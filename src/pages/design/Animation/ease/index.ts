import { addEase, getEaseList, getEaseFunction } from './manager';
import steps from './steps';
import linear from './linear';
import bounceIn from './bounceIn';
import easeInOut from './easeInOut';
import elasticOut from './elasticOut';
import acceleration from './acceleration';
import deceleration from './deceleration';

addEase(steps);
addEase(linear);
addEase(bounceIn);
addEase(easeInOut);
addEase(elasticOut);
addEase(acceleration);
addEase(deceleration);

export { addEase, getEaseList, getEaseFunction };
