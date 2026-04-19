export type Track = {
  id: string; // YouTube Video ID
  title: string;
  artist: string;
  duration: string; // MM:SS
  thumbnail?: string;
};

export const TRACK_LIST: Track[] = [
  { id: 'fHI8X4OXluQ', title: 'Blinding Lights', artist: 'The Weeknd', duration: '3:22' },
  { id: 'H5v3kku4y6Q', title: 'As It Was', artist: 'Harry Styles', duration: '2:47' },
  { id: 'BddP6PYo2gs', title: 'Kesariya', artist: 'Arijit Singh', duration: '4:28' },
  { id: 'mRD0-GxqHVo', title: 'Heat Waves', artist: 'Glass Animals', duration: '3:58' },
  { id: 'TUVcZfQe-Kw', title: 'Levitating', artist: 'Dua Lipa', duration: '3:23' },
  { id: 'IJq0yyWbk1w', title: 'Tum Hi Ho', artist: 'Arijit Singh', duration: '4:22' },
  { id: 'kTJczUoc26U', title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', duration: '2:21' },
  { id: 'ywnAWziBs0Q', title: 'Raataan Lambiyan', artist: 'Jubin Nautiyal, Asees Kaur', duration: '3:50' },
  { id: 'XXYlCGtcZA0', title: 'Save Your Tears', artist: 'The Weeknd', duration: '3:35' },
  { id: '5Eqb_-j3FDA', title: 'Pasoori', artist: 'Ali Sethi, Shae Gill', duration: '3:44' },
  { id: 'wH9M69_Fv8s', title: 'Enna Sona', artist: 'Arijit Singh', duration: '3:33' },
  { id: 'VAdGW7QDJiU', title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao', duration: '3:20' },
  { id: 'RLzC55ai0eo', title: 'Heeriye', artist: 'Arijit Singh, Jasleen Royal', duration: '3:14' },
  { id: 'zi6DCHpL3-E', title: 'Dil Jhoom', artist: 'Arijit Singh, Mithoon', duration: '3:29' },
  { id: 'L7mg_p4O4pA', title: 'Guli Mata', artist: 'Saad Lamjarred, Shreya Ghoshal', duration: '4:31' },
  { id: 'ebfLALQ9R90', title: 'Apna Bana Le', artist: 'Arijit Singh', duration: '4:21' },
  { id: 'M-K7mSfbG28', title: 'Tera Fitoor', artist: 'Arijit Singh', duration: '3:32' },
  { id: '6vYn_9uS7tM', title: 'Manike', artist: 'Yohani, Jubin Nautiyal', duration: '3:17' },
  { id: 'qYy_S1_S3u8', title: 'Zinda Banda', artist: 'Anirudh Ravichander', duration: '3:24' },
  { id: 'hc9L-uD_DqQ', title: 'Besharam Rang', artist: 'Shilpa Rao, Caralisa Monteiro', duration: '3:18' },
  { id: 'DIsX0380R8s', title: 'Naacho Naacho', artist: 'Rahul Sipligunj, Kaala Bhairava', duration: '3:35' },
  { id: 'Sgj0W7M9T7k', title: 'Agar Tum Saath Ho', artist: 'Arijit Singh, Alka Yagnik', duration: '5:41' },
  { id: '9u14-QBPzSE', title: 'Pee Loon', artist: 'Mohit Chauhan', duration: '4:47' },
  { id: 'rL9In6-L3sQ', title: 'Jeene Laga Hoon', artist: 'Atif Aslam, Shreya Ghoshal', duration: '3:56' },
  { id: 'vA86QFrXnho', title: 'Kaun Tujhe', artist: 'Palak Muchhal', duration: '4:01' },
  { id: '8vC0p_mD6E0', title: 'Tera Ban Jaunga', artist: 'Akhil Sachdeva, Tulsi Kumar', duration: '3:55' },
  { id: 'kJ_M0R-hM8k', title: 'Hawayein', artist: 'Arijit Singh', duration: '4:50' },
  { id: 'H_pG-0kF3u4', title: 'Vaaste', artist: 'Dhvani Bhanushali', duration: '4:27' },
  { id: 'O73Y7lqYxXo', title: 'Ghungroo', artist: 'Arijit Singh, Shilpa Rao', duration: '5:02' },
  { id: 'mAnY_uIubZ4', title: 'Raabta', artist: 'Arijit Singh', duration: '4:03' },
  { id: 'N_S0-rY-TfI', title: 'Dil Diyan Gallan', artist: 'Atif Aslam', duration: '4:20' },
  { id: 'I_2D8EmYhS4', title: 'Gerua', artist: 'Arijit Singh, Antara Mitra', duration: '5:45' },
];
