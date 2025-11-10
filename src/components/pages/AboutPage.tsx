import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Award, Heart, Users, Target, CheckCircle, TrendingUp } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { Card } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Progress } from '../ui/progress';
import { api } from '../../api/client';

interface TimelineItem { id?: string; year: number; title: string; description?: string | null; }
interface ValueItem { id?: string; title: string; description?: string | null; icon?: string | null; }
interface SkillItem { id?: string; name: string; level: number; }
interface Mission { heading?: string | null; paragraph?: string | null; }
interface MissionBullet { id?: string; text: string; }
interface TeamMember { id?: string; name: string; role: string; bio?: string | null; image?: string | null; active?: boolean; }

export function AboutPage() {
  const { isRTL } = useLanguage();

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [values, setValues] = useState<ValueItem[]>([]);
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [mission, setMission] = useState<Mission | null>(null);
  const [missionBullets, setMissionBullets] = useState<MissionBullet[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [stats, setStats] = useState<{ icon: string; value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const [aboutData, teamData, homeData] = await Promise.all([
          api.about(),
          api.team(),
          api.home(), // reuse home stats for bottom section (assumption)
        ]);
        if (cancelled) return;
        setTimeline((aboutData.timeline || []).map((t: any) => ({ ...t })));
        setValues(aboutData.values || []);
        setSkills(aboutData.skills || []);
        setMission(aboutData.mission || null);
        setMissionBullets(aboutData.missionBullets || []);
        setTeam(teamData || []);
        // Map home stats to local shape if available; fallback to empty (removes static array)
        const mappedStats = (homeData?.stats || []).slice(0, 4).map((s: any) => ({
          icon: s.icon || 'award',
          value: String(s.value),
          label: s.label || 'Stat',
        }));
        setStats(mappedStats);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load About content');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const iconComponent = (name: string) => {
    switch ((name || '').toLowerCase()) {
      case 'heart': return Heart;
      case 'award': return Award;
      case 'target': return Target;
      case 'users': return Users;
      default: return Heart; // default icon
    }
  };

  return (
    <div className="pt-20 min-h-screen">
      {loading && <div className="text-center py-32">Loading...</div>}
      {error && !loading && <div className="text-center py-32 text-red-600">{error}</div>}
      {!loading && !error && (
        <>
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              About Us
            </h1>
            <p className="text-gray-700 max-w-3xl mx-auto">
              For over 15 years, we've been dedicated to helping our clients achieve natural, beautiful results through advanced hair and eyebrow implant procedures.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1758691463333-c79215e8bc3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                alt="Our clinic"
                className="rounded-3xl shadow-2xl"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-gray-900">{mission?.heading || 'Our Mission'}</h2>
              <p className="text-gray-700">
                {mission?.paragraph || 'We strive to provide world-class services that restore confidence and enhance natural beauty with medical expertise and artistic vision.'}
              </p>
              <div className="space-y-4">
                {(missionBullets || []).map((b, index) => (
                  <motion.div
                    key={b.id || index}
                    initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle className="w-6 h-6 text-pink-500 flex-shrink-0" />
                    <span className="text-gray-700">{b.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Our Core Values
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={value.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="p-6 text-center border-0 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-pink-50/30">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    {(() => {
                      const Icon = iconComponent(value.icon || 'heart');
                      return <Icon className="w-8 h-8 text-white" />;
                    })()}
                  </div>
                  <h3 className="mb-3 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Our Journey
            </h2>
            <p className="text-gray-600">
              A legacy of excellence and innovation
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-pink-500 to-purple-600" />

            <div className="space-y-12">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.id || index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? (isRTL ? 50 : -50) : (isRTL ? -50 : 50) }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className={`flex items-center gap-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'text-right rtl:text-left' : 'text-left rtl:text-right'}`}>
                    <Card className="p-6 bg-white shadow-lg inline-block">
                      <div className="text-pink-600 mb-2">{item.year}</div>
                      <h3 className="mb-2 text-gray-900">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </Card>
                  </div>
                  <div className="w-4 h-4 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full ring-4 ring-white shadow-lg z-10" />
                  <div className="flex-1" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Our Expertise
              </h2>
              <p className="text-gray-700 mb-8">
                We pride ourselves on maintaining the highest levels of proficiency across all our services, ensuring exceptional results for every client.
              </p>
              <div className="space-y-6">
                {skills.map((skill, index) => (
                  <motion.div
                    key={skill.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-900">{skill.name}</span>
                      <span className="text-pink-600">{skill.level}%</span>
                    </div>
                    <Progress value={skill.level} className="h-2" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1664549761426-6a1cb1032854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                alt="Treatment"
                className="rounded-3xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Meet Our Team
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our board-certified specialists are dedicated to your care
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all">
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={member.image || undefined}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-6 text-center bg-white">
                    <h3 className="mb-2 text-gray-900">{member.name}</h3>
                    <p className="text-pink-600 mb-3">{member.role}</p>
                    <p className="text-gray-600">{member.bio}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
        {/* Stats (dynamic from home stats) */}
        <section className="py-20 bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = iconComponent(stat.icon);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center text-white"
                  >
                    <Icon className="w-12 h-12 mx-auto mb-4" />
                    <div className="mb-2">{stat.value}</div>
                    <p className="text-white/90">{stat.label}</p>
                  </motion.div>
                );
              })}
              {stats.length === 0 && (
                <div className="col-span-4 text-center text-white/80">No stats available</div>
              )}
            </div>
          </div>
        </section>
        </>
      )}
    </div>
  );
}
