import { getDriveBooks, getGithubBooks, formatDriveBook } from './books.js';
import { fetchInternetArchivePopular, interleaveArrays } from './external.js';

export const getPopularBooks = async () => {
  try {
    const [allDriveBooks, allGhBooks] = await Promise.all([
      getDriveBooks(),
      getGithubBooks()
    ]);

    // Select featured hero book from top bestsellers
    const heroes = allGhBooks.filter(b => 
      b.title.includes('Atomic Habits') || 
      b.title.includes('Thinking, Fast and Slow') || 
      b.title.includes('Deep Work') ||
      b.title.includes('12 Rules for Life') ||
      b.title.includes('48 Laws of Power')
    );
    const featuredHero = heroes.length > 0 ? heroes[Math.floor(Math.random() * heroes.length)] : allGhBooks[0];

    const otherGh = allGhBooks.filter(b => b.id !== featuredHero?.id);
    const shuffledGh = [...otherGh].sort(() => Math.random() - 0.5).slice(0, 24);
    const shuffledDrive = [...allDriveBooks].sort(() => Math.random() - 0.5).slice(0, 20).map(formatDriveBook);

    const localPool = interleaveArrays(shuffledGh, shuffledDrive);
    if (featuredHero) {
      return [featuredHero, ...localPool];
    }
    return localPool;
  } catch (error) {
    console.error('Error fetching popular books:', error);
    return [];
  }
};

export const getBooksByCategory = async (category) => {
  try {
    const catLower = category.toLowerCase();
    const allGhBooks = await getGithubBooks();

    if (catLower === 'self_help' || catLower === 'personal_growth') {
      const matched = allGhBooks.filter(b => 
        (b.categories || []).some(c => c.toLowerCase().includes('self-help') || c.toLowerCase().includes('mind') || c.toLowerCase().includes('growth') || c.toLowerCase().includes('bestseller')) ||
        (b.title || '').toLowerCase().includes('habit') || (b.title || '').toLowerCase().includes('think') || (b.title || '').toLowerCase().includes('power')
      );
      const shuffled = [...matched].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 40);
    }

    if (catLower === 'philosophy') {
      const matched = allGhBooks.filter(b => 
        (b.categories || []).some(c => c.toLowerCase().includes('philosophy') || c.toLowerCase().includes('wisdom')) ||
        (b.title || '').toLowerCase().includes('meditation') || (b.title || '').toLowerCase().includes('war') || (b.title || '').toLowerCase().includes('stoic')
      );
      const shuffled = [...matched].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 40);
    }

    if (catLower === 'business') {
      const matched = allGhBooks.filter(b => 
        (b.categories || []).some(c => c.toLowerCase().includes('business') || c.toLowerCase().includes('success') || c.toLowerCase().includes('startup'))
      );
      const shuffled = [...matched].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 40);
    }

    if (catLower === 'data_science' || catLower === 'machine_learning') {
      const matched = allGhBooks.filter(b => (b.categories || []).some(c => c.toLowerCase().includes('data') || c.toLowerCase().includes('machine') || c.toLowerCase().includes('learning')));
      const shuffled = [...matched].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 40);
    }

    if (catLower === 'cybersecurity') {
      const matched = allGhBooks.filter(b => (b.categories || []).some(c => c.toLowerCase().includes('security') || c.toLowerCase().includes('cyber') || c.toLowerCase().includes('pentest') || c.toLowerCase().includes('hack')));
      const shuffled = [...matched].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 40);
    }

    if (catLower === 'programming') {
      const matched = allGhBooks.filter(b => (b.categories || []).some(c => c.toLowerCase().includes('programming') || c.toLowerCase().includes('python') || c.toLowerCase().includes('javascript') || c.toLowerCase().includes('rust') || c.toLowerCase().includes('go') || c.toLowerCase().includes('c++')));
      const shuffled = [...matched].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 40);
    }

    const [allDriveBooks, iaBooks] = await Promise.all([
      getDriveBooks(),
      fetchInternetArchivePopular(category, 12).catch(() => [])
    ]);

    const shuffled = [...allDriveBooks].sort(() => Math.random() - 0.5);
    const driveBooks = shuffled.slice(0, 25).map(formatDriveBook);

    return interleaveArrays(driveBooks, iaBooks);
  } catch (error) {
    console.error('Error fetching category books:', error);
    return [];
  }
};

export const getRecommendations = async (readlist) => {
  if (!readlist || readlist.length === 0) return [];
  try {
    const allCategories = readlist.flatMap(book => book.categories || []);
    const categoryCounts = allCategories.reduce((acc, cat) => {
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    const topCategory = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a])[0];
    
    if (topCategory) {
      return await getBooksByCategory(topCategory);
    }
    
    return await getPopularBooks();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};
