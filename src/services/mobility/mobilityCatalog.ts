// Mobility & Stretching Catalog
// Evidence-based mobility sequences for targeted muscle decompression and active recovery

import { MuscleGroup } from '../../types/health';
import { MobilityExercise, MobilityRoutine } from '../../types/mobility';

export const MOBILITY_EXERCISES_BY_MUSCLE: Record<MuscleGroup, MobilityExercise[]> = {
  hamstrings: [
    {
      id: 'ham_90_90_reach',
      name: '90/90 Hamstring Active Reach',
      targetMuscle: 'hamstrings',
      bilateral: true,
      durationSeconds: 40,
      restSeconds: 10,
      instructions: 'Sit tall with one leg extended. Hinge strictly at the hips with a flat spine until tension is felt in the hamstring belly.',
      benefit: 'Decompresses biceps femoris and restores hip extension mechanics.',
      breathingCue: 'Inhale to lengthen spine; exhale and melt 1cm deeper.',
      poseCue: 'Keep toes dorsiflexed (pointing to ceiling) to engage the deep fascial line.',
    },
    {
      id: 'ham_worlds_greatest',
      name: "World's Greatest Lunge & Reach",
      targetMuscle: 'hamstrings',
      bilateral: true,
      durationSeconds: 45,
      restSeconds: 10,
      instructions: 'Step into a deep runner lunge. Place hands inside the front foot, drop the back hip, then rotate the inside arm toward the ceiling.',
      benefit: 'Integrates hamstring lengthening with thoracic spine mobility.',
      breathingCue: 'Exhale as you rotate your chest upward; hold at the top.',
      poseCue: 'Keep the trailing knee straight and drive through the back heel.',
    },
    {
      id: 'ham_standing_floss',
      name: 'Standing Single-Leg Hinge Floss',
      targetMuscle: 'hamstrings',
      bilateral: true,
      durationSeconds: 35,
      restSeconds: 10,
      instructions: 'Place one heel on the floor ahead of you. Soften the supporting knee, hinge back with your hips, and sweep hands past your shin.',
      benefit: 'Gently glides the sciatic nerve tract and releases proximal tendon stiffness.',
      breathingCue: 'Slow rhythmic deep breathing throughout the sweep.',
      poseCue: 'Do not round the lower back; pivot exclusively from the pelvis.',
    },
  ],

  quads: [
    {
      id: 'quad_couch_stretch',
      name: 'Half-Kneeling Couch Stretch',
      targetMuscle: 'quads',
      bilateral: true,
      durationSeconds: 40,
      restSeconds: 10,
      instructions: 'Kneel in front of a wall with rear shin vertical against the wall. Step other foot forward into a 90° lunge. Squeeze glute and press hips forward.',
      benefit: 'Isolates the rectus femoris and releases anterior pelvic tilt.',
      breathingCue: 'Exhale deeply into pelvic tilt; maintain abdominal brace.',
      poseCue: 'Squeeze the trailing glute tightly to inhibit reciprocal quad tension.',
    },
    {
      id: 'quad_prone_pull',
      name: 'Prone Quad Elongation',
      targetMuscle: 'quads',
      bilateral: true,
      durationSeconds: 35,
      restSeconds: 10,
      instructions: 'Lie face down. Reach back to grasp your ankle or foot, drawing heel gently toward the glute while pressing hips into the mat.',
      benefit: 'Promotes deep vascular flow through the vastus medialis and intermedius.',
      breathingCue: 'Long slow diaphragmatic exhale to relax thigh musculature.',
      poseCue: 'Keep both hip points grounded flat against the floor.',
    },
    {
      id: 'quad_low_lunge_pulse',
      name: 'Low Lunge Psoas & Quad Pulse',
      targetMuscle: 'quads',
      bilateral: true,
      durationSeconds: 40,
      restSeconds: 10,
      instructions: 'In a deep knee-down lunge, gently oscillate hips forward and down by 2-3cm, then ease back.',
      benefit: 'Releases hip flexor tightness from heavy squats and prolonged sitting.',
      breathingCue: 'Match pulses to continuous rhythmic breathing.',
      poseCue: 'Keep your front knee stacked directly over the front ankle.',
    },
  ],

  chest: [
    {
      id: 'chest_doorway_opener',
      name: 'Doorway Pectoral High/Mid Opener',
      targetMuscle: 'chest',
      bilateral: true,
      durationSeconds: 40,
      restSeconds: 10,
      instructions: 'Place forearm against a door frame or wall at 90°. Step forward with inside foot and gently rotate torso away.',
      benefit: 'Stretches pectoralis major and minor, counteracting rounded shoulder posture.',
      breathingCue: 'Inhale into the ribcage; exhale and allow chest to open.',
      poseCue: 'Keep shoulders packed down away from your ears.',
    },
    {
      id: 'chest_floor_scorpion',
      name: 'Prone Floor Scorpion Stretch',
      targetMuscle: 'chest',
      bilateral: true,
      durationSeconds: 40,
      restSeconds: 10,
      instructions: 'Lie face down with arms outstretched like a T. Lift one leg, bend knee, and reach foot across body toward opposite hand.',
      benefit: 'Dynamic opening of anterior chest capsule, hip flexors, and spine.',
      breathingCue: 'Exhale as foot reaches across body; pause for 2 seconds.',
      poseCue: 'Keep the grounded shoulder and palm glued to the floor.',
    },
    {
      id: 'chest_cactus_expansion',
      name: 'Chest Expansion Cactus Flow',
      targetMuscle: 'chest',
      bilateral: false,
      durationSeconds: 45,
      restSeconds: 10,
      instructions: 'Sit or stand tall. Draw elbows back in a 90° cactus shape, squeezing shoulder blades together and lifting sternum.',
      benefit: 'Engages rhomboids while opening tight clavicular pectoral fibers.',
      breathingCue: 'Inhale deep into collarbones as elbows pull back.',
      poseCue: 'Avoid arching low back; keep core softly engaged.',
    },
  ],

  back: [
    {
      id: 'back_childs_pose_lat',
      name: "Wide Child's Pose with Lat Reach",
      targetMuscle: 'back',
      bilateral: true,
      durationSeconds: 45,
      restSeconds: 10,
      instructions: 'Kneel with big toes touching and knees wide. Sit hips back onto heels, walk hands forward, then walk hands 45° to the right/left.',
      benefit: 'Deep elongation of the latissimus dorsi, teres major, and thoracolumbar fascia.',
      breathingCue: 'Breathe into the lateral ribcage and armpit of the stretching side.',
      poseCue: 'Keep both sit bones anchored firmly to your heels.',
    },
    {
      id: 'back_cat_cow',
      name: 'Cat-Cow Thoracic Articulation',
      targetMuscle: 'back',
      bilateral: false,
      durationSeconds: 50,
      restSeconds: 10,
      instructions: 'On all fours, alternate between arching spine with head lifted (Cow) and rounding spine with chin tucked (Cat).',
      benefit: 'Restores segmental spinal hydration and relieves lower back compression.',
      breathingCue: 'Inhale on Cow (extension); exhale deeply on Cat (flexion).',
      poseCue: 'Move vertebrae one by one from tailbone to crown.',
    },
    {
      id: 'back_thread_needle',
      name: 'Thread the Needle Thoracic Opener',
      targetMuscle: 'back',
      bilateral: true,
      durationSeconds: 40,
      restSeconds: 10,
      instructions: 'From tabletop, slide right arm under torso across the floor until right shoulder and temple rest on the mat.',
      benefit: 'Unlocks upper back tension between the scapulae and cervical junction.',
      breathingCue: 'Exhale and surrender shoulder weight into the floor.',
      poseCue: 'Keep hips square and centered directly above the knees.',
    },
  ],

  shoulders: [
    {
      id: 'shld_posterior_capsule',
      name: 'Cross-Body Posterior Capsule Stretch',
      targetMuscle: 'shoulders',
      bilateral: true,
      durationSeconds: 40,
      restSeconds: 10,
      instructions: 'Bring one arm horizontally across your chest. Use opposite forearm to gently compress the arm toward your torso.',
      benefit: 'Relieves posterior deltoid and infraspinatus tightness after overhead presses.',
      breathingCue: 'Slow steady breathing; relax the stretching shoulder down.',
      poseCue: 'Do not allow shoulder to shrug toward the ear.',
    },
    {
      id: 'shld_wall_angels',
      name: 'Standing Wall Angels',
      targetMuscle: 'shoulders',
      bilateral: false,
      durationSeconds: 45,
      restSeconds: 10,
      instructions: 'Stand with heels, glutes, upper back, elbows, and back of hands against a wall. Slowly slide arms overhead without losing contact.',
      benefit: 'Promotes scapular upward rotation and activates lower trapezius.',
      breathingCue: 'Inhale sliding up; exhale returning to starting position.',
      poseCue: 'Maintain low back contact with wall; avoid excessive rib flare.',
    },
    {
      id: 'shld_sleeper_stretch',
      name: 'Sidelying Rotator Cuff Sleeper Stretch',
      targetMuscle: 'shoulders',
      bilateral: true,
      durationSeconds: 35,
      restSeconds: 10,
      instructions: 'Lie on side with bottom elbow bent at 90°. Use top hand to gently press bottom wrist downward toward the floor.',
      benefit: 'Restores glenohumeral internal rotation and prevents impingement.',
      breathingCue: 'Gentle pressure only; never force through pinch or pain.',
      poseCue: 'Roll slightly back so shoulder blade is supported by the floor.',
    },
  ],

  glutes: [
    {
      id: 'glute_pigeon_pose',
      name: 'Seated Figure-4 Pigeon Pose',
      targetMuscle: 'glutes',
      bilateral: true,
      durationSeconds: 45,
      restSeconds: 10,
      instructions: 'Cross ankle over opposite knee in a chair or seated on floor. Keep spine neutral and gently fold forward from hip crease.',
      benefit: 'Decompresses piriformis and gluteus medius, freeing sciatic pressure.',
      breathingCue: 'Inhale tall; exhale fold slightly forward into hip resistance.',
      poseCue: 'Keep the crossed foot active and flexed to protect knee ligaments.',
    },
    {
      id: 'glute_90_90_flow',
      name: '90/90 Hip Mobility Transitions',
      targetMuscle: 'glutes',
      bilateral: true,
      durationSeconds: 45,
      restSeconds: 10,
      instructions: 'Sit with both knees bent at 90° angles (one in front, one to side). Lean forward over front shin, then rotate knees to switch sides.',
      benefit: 'Dual restoration of internal and external hip rotational freedom.',
      breathingCue: 'Smooth continuous diaphragmatic breath on each transition.',
      poseCue: 'Keep chest lifted and tall throughout the rotation.',
    },
    {
      id: 'glute_bridge_opener',
      name: 'Isometric Glute Bridge & Squeeze',
      targetMuscle: 'glutes',
      bilateral: false,
      durationSeconds: 40,
      restSeconds: 10,
      instructions: 'Lie on back with knees bent and feet hip-width. Drive through heels to raise pelvis, hold at top with active glute contraction.',
      benefit: 'Wakes up dormant glutes and elongates tight hip flexors.',
      breathingCue: 'Exhale driving upward; breathe steadily at the apex.',
      poseCue: 'Avoid hyperextending low back; ribs stay down.',
    },
  ],

  calves: [
    {
      id: 'calf_downward_pedal',
      name: 'Downward Dog Alternating Calf Pedals',
      targetMuscle: 'calves',
      bilateral: false,
      durationSeconds: 45,
      restSeconds: 10,
      instructions: 'In an inverted V position, alternately bend one knee while driving the opposite heel toward the floor, pausing 2 seconds per side.',
      benefit: 'Stretches the gastrocnemius, soleus, and plantar fascia.',
      breathingCue: 'Exhale as each heel presses into the ground.',
      poseCue: 'Push floor away with palms and lift tailbone high.',
    },
    {
      id: 'calf_wall_gastroc',
      name: 'Wall Gastrocnemius Active Drop',
      targetMuscle: 'calves',
      bilateral: true,
      durationSeconds: 40,
      restSeconds: 10,
      instructions: 'Face a wall with hands at chest height. Step one leg back with knee locked straight and heel flat. Lean into wall.',
      benefit: 'Direct mechanical stretch for the upper calf belly and Achilles tendon.',
      breathingCue: 'Slow steady breathing into the back calf.',
      poseCue: 'Keep back toes pointing straight ahead, not angled out.',
    },
  ],

  biceps: [
    {
      id: 'bicep_wall_glide',
      name: 'Wall Palm Bicep Elongation',
      targetMuscle: 'biceps',
      bilateral: true,
      durationSeconds: 40,
      restSeconds: 10,
      instructions: 'Place hand flat against a wall at shoulder height with fingers pointing back. Slowly rotate chest away from the wall.',
      benefit: 'Elongates biceps brachii and anterior shoulder joint capsule.',
      breathingCue: 'Exhale as you turn torso slightly outward.',
      poseCue: 'Keep elbow softly micro-bent; avoid harsh hyperextension.',
    },
    {
      id: 'bicep_wrist_flexor',
      name: 'Kneeling Wrist & Forearm Flexor Stretch',
      targetMuscle: 'biceps',
      bilateral: false,
      durationSeconds: 35,
      restSeconds: 10,
      instructions: 'Kneel with palms on floor, fingers pointing back toward knees. Gently lean bodyweight back onto heels.',
      benefit: 'Releases forearm flexors and distal bicep insertion tension.',
      breathingCue: 'Deep steady breaths; ease into wrist extension.',
      poseCue: 'Keep palms completely flat against the mat.',
    },
  ],

  triceps: [
    {
      id: 'tricep_overhead_pull',
      name: 'Overhead Tricep & Lat Elongation',
      targetMuscle: 'triceps',
      bilateral: true,
      durationSeconds: 40,
      restSeconds: 10,
      instructions: 'Raise one arm overhead, bend elbow so hand drops behind neck. Use opposite hand to gently draw elbow back and down.',
      benefit: 'Stretches long head of triceps and lateral upper arm.',
      breathingCue: 'Inhale tall through spine; exhale and ease elbow backward.',
      poseCue: 'Keep head upright; do not push chin down to chest.',
    },
  ],

  core: [
    {
      id: 'core_cobra_elongation',
      name: 'Prone Cobra Abdominal Elongation',
      targetMuscle: 'core',
      bilateral: false,
      durationSeconds: 45,
      restSeconds: 10,
      instructions: 'Lie prone with hands under shoulders. Press through palms to lift chest, lengthening the abdominal wall without pinching low back.',
      benefit: 'Gently decompresses rectus abdominis after intense core exercises.',
      breathingCue: 'Inhale deeply expanding belly; exhale relaxing shoulders down.',
      poseCue: 'Keep pubic bone grounded to protect lumbar vertebrae.',
    },
    {
      id: 'core_kneeling_side_bend',
      name: 'Kneeling Side-Bending Oblique Reach',
      targetMuscle: 'core',
      bilateral: true,
      durationSeconds: 40,
      restSeconds: 10,
      instructions: 'Kneel tall. Reach one arm overhead and laterally flex torso to the opposite side, opening the entire rib-to-hip flank.',
      benefit: 'Elongates obliques, quadratus lumborum, and intercostal muscles.',
      breathingCue: 'Breathe directly into the expanded side ribs.',
      poseCue: 'Stay in the frontal plane; avoid twisting torso forward.',
    },
  ],
};

// Generate a routine tailored to specific muscle or all fatigued muscles
export function buildRoutineForMuscle(muscle: MuscleGroup): MobilityRoutine {
  const exercises = MOBILITY_EXERCISES_BY_MUSCLE[muscle] || MOBILITY_EXERCISES_BY_MUSCLE.hamstrings;
  const totalSeconds = exercises.reduce((acc, ex) => {
    const sets = ex.bilateral ? 2 : 1;
    return acc + (ex.durationSeconds + ex.restSeconds) * sets;
  }, 0);

  const displayTitle = muscle.charAt(0).toUpperCase() + muscle.slice(1);

  return {
    id: `routine_${muscle}`,
    title: `${displayTitle} Restorative Flow`,
    description: `Targeted active stretching and mobility to accelerate supercompensation and tissue recovery for ${displayTitle}.`,
    targetMuscles: [muscle],
    estimatedMinutes: Math.ceil(totalSeconds / 60),
    exercises,
  };
}

// Generate dynamic compound routine for whatever muscles are currently fatigued
export function buildDynamicDeFatigueRoutine(fatiguedMuscles: MuscleGroup[]): MobilityRoutine {
  if (fatiguedMuscles.length === 0) {
    // Default full body daily restorative routine
    const fullBodyExercises: MobilityExercise[] = [
      MOBILITY_EXERCISES_BY_MUSCLE.hamstrings[0],
      MOBILITY_EXERCISES_BY_MUSCLE.quads[0],
      MOBILITY_EXERCISES_BY_MUSCLE.chest[0],
      MOBILITY_EXERCISES_BY_MUSCLE.back[0],
      MOBILITY_EXERCISES_BY_MUSCLE.glutes[0],
    ];

    return {
      id: 'routine_full_body_restore',
      title: 'Full-Body Restoration Flow',
      description: 'Balanced 5-minute active stretching sequence targeting major kinetic checkpoints for total body relaxation.',
      targetMuscles: ['hamstrings', 'quads', 'chest', 'back', 'glutes'],
      estimatedMinutes: 5,
      exercises: fullBodyExercises,
    };
  }

  // Gather 1-2 top exercises for each fatigued muscle group (up to 5 exercises total)
  const selectedExercises: MobilityExercise[] = [];
  const targetMusclesSet = new Set<MuscleGroup>();

  for (const m of fatiguedMuscles) {
    const list = MOBILITY_EXERCISES_BY_MUSCLE[m];
    if (list && list.length > 0) {
      selectedExercises.push(list[0]);
      targetMusclesSet.add(m);
      if (selectedExercises.length < 4 && list.length > 1) {
        selectedExercises.push(list[1]);
      }
    }
    if (selectedExercises.length >= 5) break;
  }

  const totalSeconds = selectedExercises.reduce((acc, ex) => {
    const sets = ex.bilateral ? 2 : 1;
    return acc + (ex.durationSeconds + ex.restSeconds) * sets;
  }, 0);

  const muscleNames = Array.from(targetMusclesSet)
    .map((m) => m.charAt(0).toUpperCase() + m.slice(1))
    .join(', ');

  return {
    id: `routine_defatigue_${Date.now()}`,
    title: `Targeted De-Fatigue: ${muscleNames}`,
    description: `Scientific active recovery designed to flush metabolic byproducts from your fatigued ${muscleNames}.`,
    targetMuscles: Array.from(targetMusclesSet),
    estimatedMinutes: Math.max(3, Math.ceil(totalSeconds / 60)),
    exercises: selectedExercises,
  };
}
