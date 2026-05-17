'use client';

import { motion } from 'framer-motion';

const jours = [
  {
    jour: 'Jour 1',
    titre: "Introduction au metier d'acteur",
    items: [
      "Qu'est-ce qu'etre acteur ?",
      "L'industrie du cinema au Benin",
      "Les differents types de jeu (theatre, cinema, TV)",
    ],
  },
  {
    jour: 'Jour 2',
    titre: "Techniques et maitrise du jeu",
    items: [
      "Preparation physique et vocale",
      "Improvisation et spontaneite",
      "Gestion des emotions",
    ],
  },
  {
    jour: 'Jour 3',
    titre: "Castings et auditions",
    items: [
      "Comment preparer un casting",
      "Techniques d'audition",
      "Gerer le stress et la pression",
    ],
  },
  {
    jour: 'Jour 4',
    titre: "Restitution",
    items: [
      "Mise en pratique",
      "Evaluation par les formateurs",
      "Remise des attestations + Lots et surprises",
    ],
  },
];

export default function ProgrammeSection() {
  return (
    <section id="programme" className="py-24 px-4 bg-white/[0.02]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-block bg-orange-500/10 border border-orange-500/30 rounded-full px-4 py-1 text-orange-400 text-sm font-medium mb-4">
            Programme
          </div>
          <h2 className="text-4xl font-black">
            4 jours pour <span className="gradient-text">transformer</span> votre jeu
          </h2>
        </motion.div>

        <div className="relative">
          <div className="absolute left-[28px] md:left-1/2 top-0 bottom-0 w-px bg-orange-500/20 -translate-x-1/2 hidden md:block" />

          <div className="space-y-8">
            {jours.map((jour, i) => (
              <motion.div
                key={jour.jour}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex flex-col md:flex-row gap-6 items-start ${
                  i % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="absolute hidden md:flex left-1/2 -translate-x-1/2 w-8 h-8 bg-orange-500 rounded-full items-center justify-center text-sm font-bold text-white z-10">
                  {i + 1}
                </div>

                <div className={`card-dark rounded-2xl p-6 flex-1 ${i % 2 === 0 ? 'md:mr-10' : 'md:ml-10'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {jour.jour}
                    </span>
                    <h3 className="font-bold text-white">{jour.titre}</h3>
                  </div>
                  <ul className="space-y-2">
                    {jour.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-gray-400 text-sm">
                        <span className="text-orange-500 mt-0.5">-</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}