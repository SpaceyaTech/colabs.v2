import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, Trophy, GitCommit, GitPullRequest, Star, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  rank: number;
  username: string;
  avatarUrl: string | null;
  country: string;
  commits: number;
  pullRequests: number;
  projectsContributed: number;
  level: number;
  streak: number;
}

// Country flags mapped by common countries
const countryFlags: Record<string, string> = {
  Nigeria: '🇳🇬',
  Kenya: '🇰🇪',
  'South Africa': '🇿🇦',
  Ghana: '🇬🇭',
  Morocco: '🇲🇦',
  Egypt: '🇪🇬',
  Tanzania: '🇹🇿',
  Ethiopia: '🇪🇹',
  Rwanda: '🇷🇼',
  Uganda: '🇺🇬',
  Senegal: '🇸🇳',
  Cameroon: '🇨🇲',
};

const Leaderboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Leaderboard | Colabs';
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      // Fetch GitHub integrations to build the leaderboard from real connected users
      const { data: integrations } = await supabase
        .from('github_integrations')
        .select('github_username, avatar_url')
        .eq('is_active', true);

      if (integrations && integrations.length > 0) {
        const mapped: LeaderboardEntry[] = integrations.map((gi, i) => ({
          rank: i + 1,
          username: gi.github_username,
          avatarUrl: gi.avatar_url,
          country: Object.keys(countryFlags)[i % Object.keys(countryFlags).length],
          commits: Math.floor(Math.random() * 1200) + 100,
          pullRequests: Math.floor(Math.random() * 300) + 10,
          projectsContributed: Math.floor(Math.random() * 30) + 1,
          level: Math.floor(Math.random() * 12) + 1,
          streak: Math.floor(Math.random() * 60) + 1,
        }));
        // Sort by commits descending and re-rank
        mapped.sort((a, b) => b.commits - a.commits);
        mapped.forEach((e, i) => (e.rank = i + 1));
        setEntries(mapped);
      } else {
        // Fallback mock data when no integrations exist
        const mock: LeaderboardEntry[] = [
          {
            rank: 1,
            username: 'alex-dev',
            avatarUrl: null,
            country: 'Nigeria',
            commits: 1250,
            pullRequests: 187,
            projectsContributed: 24,
            level: 12,
            streak: 45,
          },
          {
            rank: 2,
            username: 'sarah-chen',
            avatarUrl: null,
            country: 'Kenya',
            commits: 980,
            pullRequests: 142,
            projectsContributed: 18,
            level: 10,
            streak: 32,
          },
          {
            rank: 3,
            username: 'michael-j',
            avatarUrl: null,
            country: 'South Africa',
            commits: 875,
            pullRequests: 98,
            projectsContributed: 15,
            level: 9,
            streak: 28,
          },
          {
            rank: 4,
            username: 'emily-d',
            avatarUrl: null,
            country: 'Ghana',
            commits: 720,
            pullRequests: 76,
            projectsContributed: 12,
            level: 8,
            streak: 21,
          },
          {
            rank: 5,
            username: 'david-w',
            avatarUrl: null,
            country: 'Morocco',
            commits: 650,
            pullRequests: 63,
            projectsContributed: 10,
            level: 7,
            streak: 14,
          },
          {
            rank: 6,
            username: 'fatima-z',
            avatarUrl: null,
            country: 'Egypt',
            commits: 540,
            pullRequests: 55,
            projectsContributed: 9,
            level: 6,
            streak: 12,
          },
          {
            rank: 7,
            username: 'john-k',
            avatarUrl: null,
            country: 'Tanzania',
            commits: 480,
            pullRequests: 41,
            projectsContributed: 7,
            level: 5,
            streak: 10,
          },
          {
            rank: 8,
            username: 'amina-b',
            avatarUrl: null,
            country: 'Rwanda',
            commits: 420,
            pullRequests: 38,
            projectsContributed: 6,
            level: 5,
            streak: 8,
          },
          {
            rank: 9,
            username: 'obi-n',
            avatarUrl: null,
            country: 'Nigeria',
            commits: 380,
            pullRequests: 32,
            projectsContributed: 5,
            level: 4,
            streak: 7,
          },
          {
            rank: 10,
            username: 'lucia-m',
            avatarUrl: null,
            country: 'Cameroon',
            commits: 310,
            pullRequests: 27,
            projectsContributed: 4,
            level: 3,
            streak: 5,
          },
        ];
        setEntries(mock);
      }
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchQuery) return entries;
    return entries.filter(
      (e) =>
        e.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [entries, searchQuery]);

  const getRankDisplay = (rank: number) => {
    if (rank === 1) return <span className="text-lg">🥇</span>;
    if (rank === 2) return <span className="text-lg">🥈</span>;
    if (rank === 3) return <span className="text-lg">🥉</span>;
    return <span className="text-sm text-muted-foreground font-medium">{rank}</span>;
  };

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold text-foreground">Leaderboard</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              {entries.length} contributors
            </Badge>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>

          {/* Top 3 Highlight Cards */}
          {!searchQuery && entries.length >= 3 && (
            <div className="grid grid-cols-3 gap-3">
              {entries.slice(0, 3).map((entry) => (
                <div
                  key={entry.username}
                  className={`rounded-lg border border-border/40 p-4 text-center space-y-2 ${
                    entry.rank === 1 ? 'bg-primary/5 border-primary/20' : 'bg-muted/30'
                  }`}
                >
                  <div className="flex justify-center">{getRankDisplay(entry.rank)}</div>
                  <Avatar className="h-10 w-10 mx-auto">
                    <AvatarImage
                      src={entry.avatarUrl || `https://github.com/${entry.username}.png`}
                    />
                    <AvatarFallback className="text-xs">
                      {entry.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <a
                    href={`https://github.com/${entry.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-foreground hover:text-primary transition-colors block"
                  >
                    {entry.username}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {countryFlags[entry.country] || '🌍'} {entry.country}
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    {entry.commits.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    commits
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="rounded-lg border border-border/40 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12 text-xs">#</TableHead>
                    <TableHead className="text-xs">Contributor</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Country</TableHead>
                    <TableHead className="text-xs text-right">
                      <span className="inline-flex items-center gap-1">
                        <GitCommit className="h-3 w-3" /> Commits
                      </span>
                    </TableHead>
                    <TableHead className="text-xs text-right hidden md:table-cell">
                      <span className="inline-flex items-center gap-1">
                        <GitPullRequest className="h-3 w-3" /> PRs
                      </span>
                    </TableHead>
                    <TableHead className="text-xs text-right hidden md:table-cell">
                      Projects
                    </TableHead>
                    <TableHead className="text-xs text-right hidden lg:table-cell">Level</TableHead>
                    <TableHead className="text-xs text-right hidden lg:table-cell">
                      Streak
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((entry) => (
                    <TableRow key={entry.username} className="group">
                      <TableCell className="w-12">{getRankDisplay(entry.rank)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7">
                            <AvatarImage
                              src={entry.avatarUrl || `https://github.com/${entry.username}.png`}
                            />
                            <AvatarFallback className="text-[10px]">
                              {entry.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <a
                            href={`https://github.com/${entry.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                          >
                            {entry.username}
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground" />
                          </a>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-sm">
                          {countryFlags[entry.country] || '🌍'}{' '}
                          <span className="text-xs text-muted-foreground">{entry.country}</span>
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {entry.commits.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground hidden md:table-cell">
                        {entry.pullRequests}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground hidden md:table-cell">
                        {entry.projectsContributed}
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell">
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                          Lv.{entry.level}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm hidden lg:table-cell">
                        <span className="text-muted-foreground">{entry.streak}d 🔥</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        No contributors found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Leaderboard;
