import Post from '../models/post.models.js ';
import { errorHandler } from '../Utils/error.js';

export const create = async (req, res, next) => {
  console.log('request')
    try {
  if (!req.user.isAdmin) {
    return next(errorHandler(403, 'You are not allowed to create a post'));
  }
  if (!req.body.title || !req.body.content) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }
  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');
  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });
  
  
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    
    next(error);
  }
};

export const deletepost = async (req, res, next) => {
  console.log("Here in backend");
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this post'));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json('The post has been deleted');
  } catch (error) {
    next(error);
  }
};
export const updatepost = async(req,res,next)=>{
  if(!req.user.isAdmin || req.user.id !== req.params.userId){
    return next(errorHandler(403,'You are not allowed to update the post'));
  }
  try{
    const updatedpost=await Post.findByIdAndUpdate(
      req.params.postId,
     {
      $set:{
        title:req.body.title,
        category:req.body.category,
        content:req.body.content,
        image:req.image,
      },
     },
     {new:true}
    
     ); 
     res.status(200).json(updatedpost);
  }catch(error){
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  console.log(req.query);
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.sort === 'asc' ? 1 : -1;
    console.log('sdfsdf',sortDirection);
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);
    

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });
    console.log("xx",posts);
    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    next(error);
  }
};







