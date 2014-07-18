/**
 * Created by liming on 14-7-18.
 */

hotjs = hotjs || {};
hotjs.Ad = hotjs.Ad || {};

(function(){
    var ad_options = {
        admob_ios : 'ca-app-pub-6869992474017983/4806197152',
        admob_android : 'ca-app-pub-6869992474017983/9375997553',
        bannerAtTop : true,
        overlap: true,
        offsetTopBar: false,
        isTesting : false
    };

    function initAd( options ) {
        if(options != null) {
            if(options.admob_ios !== null) ad_options.admob_ios = options.admob_ios;
            if(options.admob_android !== null) ad_options.admob_android = options.admob_android;
            if(options.bannerAtTop !== null) ad_options.bannerAtTop = options.bannerAtTop;
            if(options.overlap !== null) ad_options.overlap = options.overlap;
            if(options.isTesting !== null) ad_options.isTesting = options.isTesting;
        }

        if(window.plugins) {
            if(( /(ipad|iphone|ipod)/i.test(navigator.userAgent) ) && window.plugins.iAd) {
                window.plugins.iAd.createBannerView(
                    {
                        bannerAtTop: ad_options.bannerAtTop,
                        overlap: ad_options.overlap,
                        offsetTopBar : ad_options.offsetTopBar
                    }, function() {
                        window.plugins.iAd.ready = true;
                        window.plugins.iAd.showAd( true );
                    }, function(){
                        console.log( "failed to create ad view" );
                    });

            } else if(window.plugins.AdMob) {
                var adId = ( /(ipad|iphone|ipod)/i.test(navigator.userAgent) ) ? ad_options.admob_ios : ad_options.admob_android;

                var am = window.plugins.AdMob;
                am.createBannerView(
                    {
                        'publisherId': adId,
                        'adSize': am.AD_SIZE.BANNER,
                        'bannerAtTop': ad_options.bannerAtTop,
                        'overlap': ad_options.overlap,
                        'offsetTopBar' : ad_options.offsetTopBar
                    }, function() {
                        am.requestAd( { 'isTesting': ad_options.isTesting }, function() {
                            window.plugins.AdMob.ready = true;
                            am.showAd( true );
                        }, function() {
                            console.log('failed to request ad');
                        });
                    }, function(){
                        console.log( 'failed to create ad view' );
                    });

            } else {
                console.log('iAd / AdMob plugin not available/ready.');
            }

        } else {
            console.log('window.plugins not available/ready.');
        }
    }

    function showAd( show ) {
        if(window.plugins) {
            if(window.plugins.iAd) {
                if(window.plugins.iAd.ready) window.plugins.iAd.show( show );
            } else if(window.plugins.AdMob) {
                if(window.plugins.AdMob.ready) window.plugins.AdMob.show( show );
            } else {
                console.log('iAd / AdMob plugin not available/ready.');
            }
        }
    }

    hotjs.Ad.init = initAd;
    hotjs.Ad.show = showAd;

})();

