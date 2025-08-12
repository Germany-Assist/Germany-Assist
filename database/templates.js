export const clientPermissions = [
  2, // read asset
  6, // read contract
  11, // apply coupon
  14, // read service
  15, // create review
  16, // read review
  26, // read post
  27, // create comment
  28, // read comment
];

export const repBusinessPermissions = [
  2, // read asset
  3, // update asset (limited)
  6, // read contract
  7, // sign contract (if delegated)
  10, // read coupon
  14, // read service
  15, // create review (optional)
  16, // read review
  17, // update review (if delegated)
  26, // read post
  27, // create comment
  28, // read comment
  29, // update comment (limited)
  40, // view analytics (optional)
];

export const rootBusinessPermissions = [
  1, // create asset
  2, // read asset
  3, // update asset
  4, // delete asset
  5, // restore asset
  6, // export asset
  7, // create contract
  8, // read contract
  9, // sign contract
  10, // terminate contract
  11, // approve contract
  12, // reject contract
  13, // create coupon
  14, // read coupon
  15, // apply coupon
  16, // deactivate coupon
  17, // approve coupon
  18, // reject coupon
  19, // create service
  20, // read service
  21, // update service
  22, // delete service
  23, // publish service
  24, // unpublish service
  25, // approve service
  26, // reject service
  27, // create review
  28, // read review
  29, // update review
  30, // delete review
  31, // moderate review
  32, // create post
  33, // read post
  34, // update post
  35, // delete post
  36, // publish post
  37, // unpublish post
  38, // moderate post
  39, // restore post
  40, // assign permission
  41, // revoke permission
  42, // list permissions
  43, // create comment
  44, // read comment
  45, // update comment
  46, // delete comment
  47, // moderate comment
  48, // create business
  49, // read business
  50, // update business
  51, // delete business
  52, // restore business
  53, // manage business users
  54, // view analytics
];

export const adminPermissions = ["*"]; // wildcard: all permissions
